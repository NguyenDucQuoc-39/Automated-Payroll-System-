// Phiên bản chuyển đổi sang Ant Design, giữ nguyên logic, cập nhật UI/UX tương đương
// Tập trung chuyển đổi các thành phần MUI sang Ant Design, ví dụ:
// Typography => Typography.Title / Text
// Button => Button (antd)
// Dialog => Modal
// Table, Form, Input, Select, Pagination từ antd

// Do phần nội dung rất dài, đoạn code này được chia nhỏ thành các phần module để dễ bảo trì
// Đây là phần khung chính đã được chuyển đổi, bạn có thể yêu cầu các phần chi tiết hơn như Form modal hoặc Table riêng biệt nếu muốn tiếp tục tối ưu hóa

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import {
  Typography,
  Button,
  Input,
  Select,
  Table,
  Modal,
  Form,
  Space,
  message,
  Upload,
  Alert,
  Spin,
  Pagination
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  SearchOutlined
} from '@ant-design/icons';
import * as XLSX from 'xlsx';

import api from '../../services/api';
import { RootState } from '../../store';
import { Degree, FrontendFormDegreeType, BackendDegreeType } from '../../types/typeFrontend';

const { Title, Text } = Typography;
const { Option } = Select;

const DegreesPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.role === 'ADMIN';

  const [degrees, setDegrees] = useState<Degree[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [editingDegree, setEditingDegree] = useState<Degree | null>(null);
  const [form] = Form.useForm();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const degreeTypes = [
    { value: 'Thạc sĩ', label: 'Thạc sĩ' },
    { value: 'Tiến sĩ', label: 'Tiến sĩ' },
    { value: 'Phó Giáo Sư', label: 'Phó Giáo Sư' },
    { value: 'Giáo Sư', label: 'Giáo Sư' },
  ];

  const getDisplayDegreeType = useCallback((backendType: BackendDegreeType): string => {
    switch (backendType) {
      case 'MASTER': return 'Thạc sĩ';
      case 'DOCTOR': return 'Tiến sĩ';
      case 'ASSOCIATE_PROFESSOR': return 'Phó Giáo Sư';
      case 'PROFESSOR': return 'Giáo Sư';
      default: return backendType;
    }
  }, []);

  const fetchDegrees = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params: { [key: string]: string } = {
        page: String(page),
        limit: String(pageSize),
      };
      if (searchTerm) params.search = searchTerm;
      if (selectedType) params.type = selectedType;

      const res = await api.get('/degrees', { params });
      setDegrees(res.data.degrees);
      setTotal(res.data.total);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Lỗi khi tải dữ liệu.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedType, page, pageSize]);

  useEffect(() => {
    fetchDegrees();
  }, [fetchDegrees]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bằng cấp này?')) {
    try {
      await api.delete(`/degrees/${id}`);
      message.success('Xóa thành công');
      fetchDegrees();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Lỗi khi xóa bằng cấp.');
      }
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingDegree) {
        await api.put(`/degrees/${editingDegree.id}`, values);
        message.success('Cập nhật thành công');
      } else {
        await api.post('/degrees', values);
        message.success('Thêm mới thành công');
      }
      fetchDegrees();
      setOpenModal(false);
    } catch (error) {
      // Validation error
    }
  };

  const columns = [
    {
      title: 'STT',
      dataIndex: 'orderNumber',
    },
    {
      title: 'Loại Bằng Cấp',
      render: (record: Degree) => getDisplayDegreeType(record.type),
    },
    {
      title: 'Tên Viết Tắt',
      dataIndex: 'shortName',
    },
    {
      title: 'Tên Đầy Đủ',
      dataIndex: 'fullName',
    },
    isAdmin && {
      title: 'Thao tác',
      render: (record: Degree) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setEditingDegree(record);
              form.setFieldsValue(record);
              setOpenModal(true);
            }}
          />
          <Button
            icon={<DeleteOutlined />} danger
            onClick={() => handleDelete(record.id)}
          />
        </Space>
      ),
    },
  ].filter(Boolean);

  return (
    <div>
      <Title level={3}>Quản lý Bằng Cấp</Title>

      {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}
      {importResult && <Alert message="Import kết thúc" description={JSON.stringify(importResult)} type="info" showIcon />} 

      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="Tìm kiếm theo tên"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          prefix={<SearchOutlined />}
        />
        <Select
          allowClear
          placeholder="Loại bằng cấp"
          style={{ width: 200 }}
          value={selectedType || undefined}
          onChange={val => setSelectedType(val || '')}
        >
          {degreeTypes.map(t => (
            <Option key={t.value} value={t.value}>{t.label}</Option>
          ))}
        </Select>
        {isAdmin && (
          <>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => {
              setEditingDegree(null);
              form.resetFields();
              setOpenModal(true);
            }}>Thêm</Button>
            <Upload beforeUpload={() => false} showUploadList={false}>
              <Button icon={<UploadOutlined />}>Import từ Excel</Button>
            </Upload>
          </>
        )}
      </Space>

      <Spin spinning={loading}>
        <Table
          columns={columns as any}
          dataSource={degrees}
          rowKey="id"
          pagination={false}
        />
        <Pagination
          total={total}
          current={page}
          pageSize={pageSize}
          onChange={(p, ps) => {
            setPage(p);
            setPageSize(ps);
          }}
          style={{ marginTop: 16, float: 'right' }}
        />
      </Spin>

      <Modal
        title={editingDegree ? 'Sửa Bằng Cấp' : 'Thêm Bằng Cấp'}
        open={openModal}
        onCancel={() => setOpenModal(false)}
        onOk={handleSubmit}
        okText={editingDegree ? 'Cập nhật' : 'Thêm'}
      >
        <Form form={form} layout="vertical">
  <Form.Item
    name="type"
    label="Loại Bằng Cấp"
    rules={[{ required: true, message: 'Vui lòng chọn loại bằng cấp' }]}
  >
    <Select
      placeholder="Chọn loại bằng cấp"
      options={degreeTypes.map(({ value, label }) => ({ value, label }))}
      showSearch
      optionFilterProp="label"
    />
  </Form.Item>

  <Form.Item
    name="shortName"
    label="Tên viết tắt"
    rules={[{ required: true, message: 'Vui lòng nhập tên viết tắt' }]}
  >
    <Input
      placeholder="Ví dụ: TS, ThS, PGS, GS"
      maxLength={20}
      showCount
      allowClear
    />
  </Form.Item>

  <Form.Item
    name="fullName"
    label="Tên đầy đủ"
    rules={[{ required: true, message: 'Vui lòng nhập tên đầy đủ' }]}
  >
    <Input.TextArea
      placeholder="Ví dụ: Tiến sĩ Khoa học máy tính, Phó Giáo sư Y học"
      autoSize={{ minRows: 2, maxRows: 4 }}
      maxLength={100}
      showCount
      allowClear
    />
  </Form.Item>
</Form>
      </Modal>
    </div>
  );
};

export default DegreesPage;
