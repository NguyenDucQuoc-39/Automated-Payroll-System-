import React, { useEffect, useState } from 'react';
import { getTeacherSalaryBySchool } from '../../services/api';
import { Select, Button, Table, Typography, Card, message } from 'antd';
import api from '../../services/api';

const { Title } = Typography;

const TeacherSchoolReportPage: React.FC = () => {
  const [years, setYears] = useState<string[]>([]);
  const [semesters, setSemesters] = useState<any[]>([]);
  const [selectedYear, setSelectedYear] = useState<string | undefined>();
  const [selectedSemester, setSelectedSemester] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/semesters');
        const years = Array.from(new Set(res.data.map((s: any) => s.academicYear))) as string[];
        setYears(years);
        setSemesters(res.data);
      } catch {
        message.error('Không lấy được dữ liệu năm học/học kỳ');
      }
    };
    fetchData();
  }, []);

  const handleReport = async () => {
    if (!selectedYear && !selectedSemester) {
      message.warning('Vui lòng chọn năm học hoặc học kỳ');
      return;
    }
    setLoading(true);
    try {
      const res = await getTeacherSalaryBySchool(
        selectedSemester ? undefined : selectedYear,
        selectedSemester
      );
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
      <Title level={3}>Báo cáo tiền dạy của giảng viên toàn trường</Title>
      <div style={{ marginBottom: 16, display: 'flex', gap: 16 }}>
        <Select
          style={{ width: 160 }}
          placeholder="Chọn năm học"
          value={selectedYear}
          onChange={y => { setSelectedYear(y); setSelectedSemester(undefined); }}
          allowClear
        >
          {years.map(y => <Select.Option key={y} value={y}>{y}</Select.Option>)}
        </Select>
        <Select
          style={{ width: 180 }}
          placeholder="Chọn học kỳ"
          value={selectedSemester}
          onChange={s => { setSelectedSemester(s); setSelectedYear(undefined); }}
          allowClear
        >
          {semesters.map((s: any) => <Select.Option key={s.id} value={s.id}>{s.name} ({s.academicYear})</Select.Option>)}
        </Select>
        <Button type="primary" onClick={handleReport} loading={loading}>Xem báo cáo</Button>
      </div>
      <Card style={{ marginBottom: 16, background: '#f6ffed', borderColor: '#b7eb8f' }}>
        <b>Tổng chi phí giảng dạy toàn trường: </b>
        <span style={{ fontSize: 20, color: '#389e0d' }}>{total.toLocaleString()} VNĐ</span>
      </Card>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="teacherId"
        loading={loading}
        pagination={false}
      />
    </div>
  );
};

export default TeacherSchoolReportPage; 