import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, InputNumber, Select, Table, Spin, message, Popconfirm } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { getLessonCoefficients, createLessonCoefficient, deleteLessonCoefficient } from '../../services/lessonCoefficient.service';
import { getAcademicYears } from '../../services/semester.service';

const { Option } = Select;

const TietHeSoPage = () => {
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [academicYears, setAcademicYears] = useState<string[]>([]);
  const [filterYear, setFilterYear] = useState('');

  const fetchData = async (yearFilter?: string) => {
    setLoading(true);
    try {
      const res = await getLessonCoefficients();
      let rows = res.data;
      if (yearFilter) {
        rows = rows.filter((item: any) => item.academicYear === yearFilter);
      }
      setData(rows);
    } catch (e) {
      message.error('Không lấy được dữ liệu');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData(filterYear);
    getAcademicYears().then(res => {
      if(Array.isArray(res.data)) {
        setAcademicYears(res.data);
      } else {
        message.error('Không lấy được dữ liệu năm học');
      }
    });
  }, [filterYear]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    form.resetFields();
  };

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      if (values.amount < 0) {
        message.error('Số tiền một tiết không được là số âm!');
        return;
      }
      await createLessonCoefficient({ academicYear: values.year, amount: values.amount, status: values.status });
      handleClose();
      fetchData(filterYear);
      message.success('Thêm thiết lập thành công!');
    } catch (err) {
      // validateFields sẽ tự báo lỗi
    }
  };

  const handleDelete = async (id: string) => {
    await deleteLessonCoefficient(id);
    fetchData(filterYear);
    message.success('Xóa thành công!');
  };

  const columns = [
    { title: 'STT', dataIndex: 'index', key: 'index', render: (_: any, __: any, idx: number) => idx + 1 },
    { title: 'Năm Học', dataIndex: 'academicYear', key: 'academicYear' },
    { title: 'Số Tiền Một Tiết', dataIndex: 'amount', key: 'amount' },
    { title: 'Trạng Thái', dataIndex: 'status', key: 'status', render: (v: string) => v === 'ACTIVE' ? 'Đang áp dụng' : 'Chưa áp dụng' },
    {
      title: 'Hành Động',
      key: 'action',
      render: (_: any, row: any) => (
        <Popconfirm title="Bạn chắc chắn muốn xóa?" onConfirm={() => handleDelete(row.id)} okText="Xóa" cancelText="Hủy">
          <Button danger icon={<DeleteOutlined />} size="small" />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div>
      <h2>Thiết Lập Hệ Số Tiết</h2>
      <div style={{ marginBottom: 16, display: 'flex', gap: 16 }}>
        <Select
          style={{ minWidth: 200 }}
          placeholder="Lọc theo năm học"
          value={filterYear}
          onChange={setFilterYear}
          allowClear
        >
          <Option value="">Tất cả</Option>
          {academicYears.map((y: string) => <Option key={y} value={y}>{y}</Option>)}
        </Select>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleOpen}>Thêm thiết lập</Button>
      </div>
      <Modal
        open={open}
        title="Thêm Thiết Lập"
        onCancel={handleClose}
        onOk={handleCreate}
        okText="Tạo Thiết Lập"
        cancelText="Hủy"
        destroyOnClose
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="year" label="Chọn Năm Học Áp Dụng" rules={[{ required: true, message: 'Vui lòng chọn năm học!' }]}> 
            <Select placeholder="Chọn năm học">
              {academicYears.map((academicYear: string) => (
                <Option key={academicYear} value={academicYear}>{academicYear}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="amount" label="Số tiền một tiết" rules={[{ required: true, message: 'Vui lòng nhập số tiền!' }]}> 
            <InputNumber min={0} style={{ width: '100%' }} placeholder="Nhập số tiền một tiết" />
          </Form.Item>
          <Form.Item name="status" label="Trạng Thái" rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}> 
            <Select placeholder="Chọn trạng thái">
              <Option value="ACTIVE">Hoạt Động</Option>
              <Option value="INACTIVE">Không Hoạt Động</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
      <Spin spinning={loading} tip="Đang tải dữ liệu...">
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          pagination={false}
          style={{ marginTop: 24 }}
        />
      </Spin>
    </div>
  );
};

export default TietHeSoPage; 