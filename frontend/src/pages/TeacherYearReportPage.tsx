import React, { useEffect, useState } from 'react';
import { getTeacherSalaryByYear } from '../services/api';
import { Select, Button, Table, Typography, message } from 'antd';
import api from '../services/api';

const { Title } = Typography;

const TeacherYearReportPage: React.FC = () => {
  const [years, setYears] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState<number>(0);

  // Lấy danh sách năm học từ backend
  useEffect(() => {
    const fetchYears = async () => {
      try {
        const res = await api.get('/semesters');
        const years = Array.from(new Set(res.data.map((s: any) => s.academicYear))) as string[];
        setYears(years);
      } catch {
        message.error('Không lấy được danh sách năm học');
      }
    };
    fetchYears();
  }, []);

  const handleReport = async () => {
    if (!selectedYear) {
      message.warning('Vui lòng chọn năm học');
      return;
    }
    setLoading(true);
    try {
      const res = await getTeacherSalaryByYear(selectedYear);
      setData(res.data.teachers);
      setTotal(res.data.total);
    } catch {
      message.error('Không lấy được dữ liệu báo cáo');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: 'Mã GV', dataIndex: 'code', key: 'code' },
    { title: 'Tên Giảng viên', dataIndex: 'name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Khoa', dataIndex: 'department', key: 'department' },
    { title: 'Tổng Tiền Dạy', dataIndex: 'totalSalary', key: 'totalSalary', render: (v: number) => v.toLocaleString() + ' VNĐ' },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={3}>Báo cáo tiền dạy của giảng viên trong một năm</Title>
      <div style={{ marginBottom: 16, display: 'flex', gap: 16 }}>
        <Select
          style={{ width: 200 }}
          placeholder="Chọn năm học"
          value={selectedYear}
          onChange={setSelectedYear}
        >
          {years.map(y => <Select.Option key={y} value={y}>{y}</Select.Option>)}
        </Select>
        <Button type="primary" onClick={handleReport} loading={loading}>Xem báo cáo</Button>
      </div>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="teacherId"
        loading={loading}
        pagination={false}
        summary={() => (
          <Table.Summary.Row>
            <Table.Summary.Cell index={0} colSpan={4}><b>Tổng cộng</b></Table.Summary.Cell>
            <Table.Summary.Cell index={4}><b>{total.toLocaleString()} VNĐ</b></Table.Summary.Cell>
          </Table.Summary.Row>
        )}
      />
    </div>
  );
};

export default TeacherYearReportPage; 