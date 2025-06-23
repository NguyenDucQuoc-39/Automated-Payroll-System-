import React, { useEffect, useState } from 'react';
import { getTeacherSalaryByDepartment } from '../services/api';
import { Select, Button, Table, Typography, message } from 'antd';
import api from '../services/api';

const { Title } = Typography;

const TeacherDepartmentReportPage: React.FC = () => {
  const [departments, setDepartments] = useState<any[]>([]);
  const [years, setYears] = useState<string[]>([]);
  const [semesters, setSemesters] = useState<any[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string | undefined>();
  const [selectedYear, setSelectedYear] = useState<string | undefined>();
  const [selectedSemester, setSelectedSemester] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState<number>(0);

  // Lấy danh sách khoa, năm học, học kỳ
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [deptRes, semRes] = await Promise.all([
          api.get('/departments'),
          api.get('/semesters'),
        ]);
        if(Array.isArray(deptRes.data.departments)) {
          setDepartments(deptRes.data.departments);
        } else {
          console.error('Invalid response format for departments:', deptRes.data);
          message.error('Không lấy được dữ liệu khoa');
        }

        const years = Array.from(new Set(semRes.data.map((s: any) => s.academicYear))) as string[];
        setYears(years);
        setSemesters(semRes.data);
      } catch {
        message.error('Không lấy được dữ liệu khoa/năm học/học kỳ');
      }
    };
    fetchData();
  }, []);

  const handleReport = async () => {
    if (!selectedDepartment || (!selectedYear && !selectedSemester)) {
      message.warning('Vui lòng chọn khoa và năm học hoặc học kỳ');
      return;
    }
    setLoading(true);
    try {
      const res = await getTeacherSalaryByDepartment(
        selectedDepartment,
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
    { title: 'Bằng Cấp', dataIndex: 'degree', key: 'degree' },
    { title: 'Tổng Tiền Dạy', dataIndex: 'totalSalary', key: 'totalSalary', render: (v: number) => v.toLocaleString() + ' VNĐ' },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={3}>Báo cáo tiền dạy của giảng viên một khoa</Title>
      <div style={{ marginBottom: 16, display: 'flex', gap: 16 }}>
        <Select
          style={{ width: 200 }}
          placeholder="Chọn khoa"
          value={selectedDepartment}
          onChange={setSelectedDepartment}
        >
          {departments.map((d: any) => <Select.Option key={d.id} value={d.id}>{d.fullName}</Select.Option>)}
        </Select>
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

export default TeacherDepartmentReportPage; 