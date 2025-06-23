import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { PlusOutlined, UploadOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import {
  Table,
  Button,
  Input,
  Modal,
  Form,
  Select,
  Typography,
  Space,
  message,
  Alert,
  Upload,
  Spin,
  Pagination,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import api from '../../services/api';
import { RootState } from '../../store';

interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  fullName: string;
}

interface Department {
  id: string;
  code: string;
  shortName: string;
  fullName: string;
  office: string;
  headId: string | null;
  head?: Teacher | null;
}

const DepartmentPage: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const { user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.role === 'ADMIN';

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/departments', {
        params: { page, pageSize, search },
      });
      setDepartments(res.data.departments);
      setTotal(res.data.total);
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Lỗi khi tải danh sách khoa.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const res = await api.get('/teachers?pageSize=1000');
      const data = Array.isArray(res.data) ? res.data : res.data.data;
      setTeachers(data.map((t: any) => ({ ...t, fullName: `${t.firstName} ${t.lastName}` })));
    } catch (err) {
      console.error('Error fetching teachers:', err);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, [page, pageSize, search]);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const openModal = (department?: Department) => {
    if (department) {
      setEditingDepartment(department);
      form.setFieldsValue(department);
    } else {
      setEditingDepartment(null);
      form.resetFields();
    }
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa khoa này?')) {
      try {
        await api.delete(`/departments/${id}`);
        message.success('Đã xóa khoa.');
        fetchDepartments();
      } catch (err: any) {
        message.error(err.response?.data?.message || 'Lỗi khi xóa khoa.');
      }
    }
  };

  const handleFinish = async (values: any) => {
    setLoading(true);
    try {
      if (editingDepartment) {
        await api.put(`/departments/${editingDepartment.id}`, values);
        message.success('Cập nhật thành công.');
      } else {
        await api.post('/departments', values);
        message.success('Thêm khoa thành công.');
      }
      setModalOpen(false);
      fetchDepartments();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Lỗi khi lưu khoa.');
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<Department> = [
    {
      title: 'Mã Khoa',
      dataIndex: 'code',
    },
    {
      title: 'Tên Viết Tắt',
      dataIndex: 'shortName',
    },
    {
      title: 'Tên Đầy Đủ',
      dataIndex: 'fullName',
    },
    {
      title: 'Văn Phòng',
      dataIndex: 'office',
    },
    {
      title: 'Trưởng Khoa',
      dataIndex: ['head', 'fullName'],
      render: (_: any, record: any) => record.head ? `${record.head.firstName} ${record.head.lastName}` : 'Chưa có',
    },
    ...(isAdmin ? [
      {
        title: 'Thao Tác',
        render: (_: any, record: any) => (
          <Space>
            <Button icon={<EditOutlined />} onClick={() => openModal(record)} />
            <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
          </Space>
        ),
      },
    ] : []),
  ];

  return (
    <div style={{ padding: 24 }}>
      <Typography.Title level={3}>Quản lý Khoa</Typography.Title>

      <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
        <Input
          placeholder="Tìm kiếm..."
          prefix={<SearchOutlined />}
          style={{ width: 300 }}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />

        {isAdmin && (
          <Space>
            <Upload
              accept=".xlsx,.xls"
              showUploadList={false}
              customRequest={({ file, onSuccess, onError }) => {
                const formData = new FormData();
                formData.append('file', file as Blob);
                api.post('/departments/import', formData, {
                  headers: { 'Content-Type': 'multipart/form-data' },
                })
                  .then(res => {
                    message.success('Import thành công.');
                    fetchDepartments();
                    onSuccess && onSuccess(res.data, new XMLHttpRequest());
                  })
                  .catch(err => {
                    message.error(err.response?.data?.message || 'Import thất bại.');
                    onError && onError(err);
                  });
              }}
            >
              <Button icon={<UploadOutlined />}>Import Excel</Button>
            </Upload>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
              Thêm Khoa
            </Button>
          </Space>
        )}
      </Space>

      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={departments}
          rowKey="id"
          pagination={false}
        />
        <Pagination
          style={{ marginTop: 16, textAlign: 'right' }}
          total={total}
          current={page}
          pageSize={pageSize}
          showSizeChanger
          onChange={(p, ps) => {
            setPage(p);
            setPageSize(ps);
          }}
        />
      </Spin>

      <Modal
        open={modalOpen}
        title={editingDepartment ? 'Cập nhật Khoa' : 'Thêm Khoa'}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        okText={editingDepartment ? 'Cập nhật' : 'Thêm'}
      >
        {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 12 }} />}
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          initialValues={{ headId: null }}
        >
          <Form.Item
            name="code"
            label="Mã Khoa"
            rules={[{ required: true, message: 'Vui lòng nhập mã khoa' }]}
          >
            <Input placeholder="VD: CNTT" maxLength={20} showCount disabled={!!editingDepartment} />
          </Form.Item>

          <Form.Item
            name="shortName"
            label="Tên Viết Tắt"
            rules={[{ required: true, message: 'Vui lòng nhập tên viết tắt' }]}
          >
            <Input placeholder="VD: IT, EE" maxLength={20} showCount />
          </Form.Item>

          <Form.Item
            name="fullName"
            label="Tên Đầy Đủ"
            rules={[{ required: true, message: 'Vui lòng nhập tên đầy đủ' }]}
          >
            <Input.TextArea placeholder="VD: Khoa Công nghệ Thông tin" maxLength={100} showCount autoSize />
          </Form.Item>

          <Form.Item
            name="office"
            label="Văn Phòng"
            rules={[{ required: true, message: 'Vui lòng nhập văn phòng' }]}
          >
            <Input placeholder="VD: Tầng 2, nhà A1" maxLength={50} showCount />
          </Form.Item>

          <Form.Item name="headId" label="Trưởng Khoa">
            <Select
              allowClear
              placeholder="Chọn trưởng khoa"
              showSearch
              optionFilterProp="label"
              options={teachers.map((t) => ({
                value: t.id,
                label: `${t.fullName} (${t.email})`,
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DepartmentPage;
