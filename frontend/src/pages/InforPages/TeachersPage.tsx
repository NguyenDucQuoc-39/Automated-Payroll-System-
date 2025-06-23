// ... (phần import giữ nguyên như trước)

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Table,
  Modal,
  Form,
  Input,
  Button,
  Select,
  message,
  Upload,
  Typography,
  Space,
  Alert,
  Spin,
  Pagination,
} from 'antd';
import { PlusOutlined, UploadOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import api from '../../services/api';
import { RootState } from '../../store';
import { Gender, Role } from '../../types/typeFrontend';

const { Option } = Select;

type Degree = {
  id: string;
  fullName: string;
};

type Department = {
  id: string;
  fullName: string;
  shortName: string;
};

type Teacher = {
  id: string;
  orderNumber: number;
  firstName: string;
  lastName: string;
  gender: Gender;
  office: string;
  email: string;
  degree?: Degree;
  department?: Department;
  isHead: boolean;
};

const Teachers: React.FC = () => {
  const [form] = Form.useForm();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [degrees, setDegrees] = useState<Degree[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const { user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.role === 'ADMIN';

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/teachers', { params: { page, pageSize, search: searchQuery } });
      const data = res.data.teachers || res.data;
      setTeachers(data);
      setTotal(res.data.totalRecords || res.data.total || data.length);
    } catch (err: any) {
      message.error('Lỗi khi tải danh sách giảng viên.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, [page, pageSize, searchQuery]);

  useEffect(() => {
    api.get('/degrees/all').then(res => setDegrees(res.data || []));
    api.get('/departments/all').then(res => setDepartments(res.data || []));
  }, []);

  const handleEdit = (teacher: any) => {
    setEditingTeacher(teacher);
    form.setFieldsValue({ ...teacher, password: undefined, isHead: teacher.isHead ? 'true' : 'false' });
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/teachers/${id}`);
      message.success('Xóa giảng viên thành công!');
      fetchTeachers();
    } catch {
      message.error('Lỗi khi xóa giảng viên.');
    }
  };

  const handleFinish = async (values: any) => {
    try {
      if (editingTeacher) {
        await api.put(`/teachers/${editingTeacher.id}`, {
          ...values,
          isHead: values.isHead === 'true',
        });
        message.success('Cập nhật thành công!');
      } else {
        await api.post('/teachers', {
          ...values,
          role: 'TEACHER',
          isHead: values.isHead === 'true',
        });
        message.success('Thêm mới thành công!');
      }
      setOpen(false);
      fetchTeachers();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Lỗi xử lý.');
    }
  };

  const columns = [
    { title: 'Mã GV', dataIndex: 'orderNumber', render: (v: number) => `GV${v?.toString().padStart(4, '0')}` },
    { title: 'Họ và Tên', render: (_: any, r: any) => `${r.firstName} ${r.lastName}` },
    { title: 'Email', dataIndex: 'email' },
    { title: 'Giới Tính', dataIndex: 'gender', render: (g: Gender) => g === 'MALE' ? 'Nam' : g === 'FEMALE' ? 'Nữ' : 'Khác' },
    { title: 'Văn Phòng', dataIndex: 'office' },
    { title: 'Bằng Cấp', render: (_: any, r: any) => r.degree?.fullName || 'N/A' },
    { title: 'Khoa', render: (_: any, r: any) => r.department?.fullName || 'N/A' },
    { title: 'Vai Trò', render: (_: any, r: any) => r.isHead ? 'Trưởng Khoa' : 'Giảng Viên' },
    isAdmin ? {
      title: 'Hành Động',
      render: (_: any, r: any) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleEdit(r)} />
          <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(r.id)} />
        </Space>
      ),
    } : {},
  ];

  return (
    <>
      <Typography.Title level={3}>Quản lý Giảng Viên</Typography.Title>

      <Space style={{ marginBottom: 16 }}>
        <Input
          prefix={<SearchOutlined />}
          placeholder="Tìm kiếm..."
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {isAdmin && (
          <>
            <Upload
              accept=".xlsx,.xls"
              showUploadList={false}
              customRequest={async ({ file, onSuccess, onError }) => {
                const formData = new FormData();
                formData.append('file', file as Blob);
                try {
                  const res = await api.post('/teachers/import', formData);
                  message.success(res.data.message);
                  fetchTeachers();
                  onSuccess && onSuccess(res, file);
                } catch (err: any) {
                  message.error(err.response?.data?.message || 'Import lỗi');
                  onError && onError(err);
                }
              }}
            >
              <Button icon={<UploadOutlined />}>Import Excel</Button>
            </Upload>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => {
              setEditingTeacher(null);
              form.resetFields();
              setOpen(true);
            }}>
              Thêm Giảng Viên
            </Button>
          </>
        )}
      </Space>

      <Spin spinning={loading}>
        <Table
          rowKey="id"
          dataSource={teachers}
          columns={columns}
          pagination={false}
          bordered
        />
        <Pagination
          total={total}
          current={page}
          pageSize={pageSize}
          onChange={(p, ps) => {
            setPage(p);
            setPageSize(ps);
          }}
          style={{ marginTop: 16, textAlign: 'right' }}
        />
      </Spin>

      <Modal
        open={open}
        title={editingTeacher ? 'Cập nhật giảng viên' : 'Thêm giảng viên mới'}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={loading}
      >
        <Form
          layout="vertical"
          form={form}
          onFinish={handleFinish}
        >
          {editingTeacher && (
            <Form.Item label="Mã GV">
              <Input disabled value={`GV${editingTeacher.orderNumber?.toString().padStart(4, '0')}`} />
            </Form.Item>
          )}

          <Form.Item name="firstName" label="Họ" rules={[{ required: true, message: 'Nhập họ' }]}> <Input /> </Form.Item>
          <Form.Item name="lastName" label="Tên" rules={[{ required: true, message: 'Nhập tên' }]}> <Input /> </Form.Item>

          <Form.Item name="gender" label="Giới tính" rules={[{ required: true }]}> <Select>
            <Option value="MALE">Nam</Option>
            <Option value="FEMALE">Nữ</Option>
            <Option value="OTHER">Khác</Option>
          </Select> </Form.Item>

          <Form.Item name="office" label="Văn phòng" rules={[{ required: true }]}> <Input /> </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}> <Input /> </Form.Item>

          {!editingTeacher && (
            <Form.Item name="password" label="Mật khẩu" rules={[{ required: true }]}> <Input.Password /> </Form.Item>
          )}

          <Form.Item name="degreeId" label="Bằng cấp" rules={[{ required: true }]}> <Select>
            {degrees.map((d: any) => (
              <Option key={d.id} value={d.id}>{d.fullName}</Option>
            ))}
          </Select> </Form.Item>

          <Form.Item name="departmentId" label="Khoa" rules={[{ required: true }]}> <Select>
            {departments.map((d: any) => (
              <Option key={d.id} value={d.id}>{d.fullName} ({d.shortName})</Option>
            ))}
          </Select> </Form.Item>

          <Form.Item name="isHead" label="Vai trò" rules={[{ required: true }]}> <Select>
            <Option value="false">Giảng Viên</Option>
            <Option value="true">Trưởng Khoa</Option>
          </Select> </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default Teachers;
