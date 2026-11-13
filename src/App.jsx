import { useEffect, useMemo, useState } from 'react';

const DEFAULT_CATEGORIES = {
  expense: ['Ăn uống', 'Đi lại', 'Mua sắm', 'Nhà cửa', 'Sức khỏe', 'Giải trí', 'Hóa đơn', 'Khác'],
  income: ['Lương', 'Thưởng', 'Đầu tư', 'Quà tặng', 'Khác'],
};
const today = new Date().toISOString().slice(0, 10);
const thisMonth = today.slice(0, 7);
const money = (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value || 0);

function readStorage(key, fallback) {
  try { const value = localStorage.getItem(key); return value ? JSON.parse(value) : fallback; }
  catch { return fallback; }
}

export default function App() {
  const [transactions, setTransactions] = useState(() => readStorage('so-thu-chi-transactions', []));
  const [categories, setCategories] = useState(() => readStorage('so-thu-chi-categories', DEFAULT_CATEGORIES));
  const [budgets, setBudgets] = useState(() => readStorage('so-thu-chi-budgets', {}));
  const [month, setMonth] = useState(thisMonth);
  const [filterType, setFilterType] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ type: 'expense', amount: '', category: DEFAULT_CATEGORIES.expense[0], date: today, note: '' });
  const [budgetInput, setBudgetInput] = useState('');
  const [newCategory, setNewCategory] = useState('');

  useEffect(() => localStorage.setItem('so-thu-chi-transactions', JSON.stringify(transactions)), [transactions]);
  useEffect(() => localStorage.setItem('so-thu-chi-categories', JSON.stringify(categories)), [categories]);
  useEffect(() => localStorage.setItem('so-thu-chi-budgets', JSON.stringify(budgets)), [budgets]);

  const monthTransactions = useMemo(() => transactions.filter((item) => item.date.startsWith(month)), [transactions, month]);
  const visibleTransactions = useMemo(() => monthTransactions.filter((item) => filterType === 'all' || item.type === filterType).sort((a, b) => b.date.localeCompare(a.date)), [monthTransactions, filterType]);
  const income = monthTransactions.filter((item) => item.type === 'income').reduce((sum, item) => sum + Number(item.amount), 0);
  const expense = monthTransactions.filter((item) => item.type === 'expense').reduce((sum, item) => sum + Number(item.amount), 0);
  const balance = transactions.reduce((sum, item) => sum + (item.type === 'income' ? Number(item.amount) : -Number(item.amount)), 0);
  const budget = Number(budgets[month] || 0);
  const budgetPercent = budget ? Math.min(100, Math.round((expense / budget) * 100)) : 0;

  function changeType(type) {
    setForm((current) => ({ ...current, type, category: categories[type][0] || '' }));
  }
  function saveTransaction(event) {
    event.preventDefault();
    if (!Number(form.amount) || Number(form.amount) <= 0) return;
    const item = { ...form, amount: Number(form.amount), id: editingId || crypto.randomUUID() };
    setTransactions((current) => editingId ? current.map((row) => row.id === editingId ? item : row) : [item, ...current]);
    setEditingId(null);
    setForm({ type: 'expense', amount: '', category: categories.expense[0] || '', date: today, note: '' });
  }
  function editTransaction(item) {
    setEditingId(item.id);
    setForm({ type: item.type, amount: String(item.amount), category: item.category, date: item.date, note: item.note || '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function deleteTransaction(id) {
    if (window.confirm('Xóa giao dịch này?')) setTransactions((current) => current.filter((item) => item.id !== id));
  }
  function saveBudget(event) {
    event.preventDefault();
    setBudgets((current) => ({ ...current, [month]: Number(budgetInput) || 0 }));
    setBudgetInput('');
  }
  function addCategory(type) {
    const value = newCategory.trim();
    if (!value || categories[type].includes(value)) return;
    setCategories((current) => ({ ...current, [type]: [...current[type], value] }));
    setNewCategory('');
  }
  function removeCategory(type, value) {
    if (transactions.some((item) => item.type === type && item.category === value)) {
      window.alert('Danh mục đang được giao dịch sử dụng nên chưa thể xóa.');
      return;
    }
    setCategories((current) => ({ ...current, [type]: current[type].filter((item) => item !== value) }));
  }

  return <main className="app-shell">
    <header className="topbar"><a className="brand" href="#top"><span className="brand-icon">₫</span><span>Sổ <b>Thu Chi</b><small>Quản lý tiền bạc nhẹ nhàng</small></span></a><span className="local-badge"><i /> Dữ liệu lưu trên thiết bị</span></header>
    <section className="intro" id="top"><div><p className="eyebrow">TỔNG QUAN TÀI CHÍNH</p><h1>Chào bạn, hôm nay<br /><span>mình quản lý tiền nhé.</span></h1><p className="muted">Ghi lại từng khoản nhỏ để hiểu rõ dòng tiền của bạn.</p></div><label className="month-picker">Tháng xem<select value={month} onChange={(e) => setMonth(e.target.value)}><option value={thisMonth}>Tháng hiện tại</option><option value={new Date(Date.now() - 86400000 * 30).toISOString().slice(0, 7)}>Tháng trước</option></select><input aria-label="Chọn tháng" type="month" value={month} onChange={(e) => setMonth(e.target.value)} /></label></section>

    <section className="summary-grid" aria-label="Tổng quan"><article className="summary-card balance-card"><div className="card-heading"><span>Số dư tất cả</span><span className="icon">◈</span></div><strong>{money(balance)}</strong><small>Tính từ tất cả giao dịch đã ghi</small></article><article className="summary-card"><div className="card-heading"><span>Khoản thu tháng này</span><span className="icon green">↗</span></div><strong className="green-text">{money(income)}</strong><small>{monthTransactions.filter((t) => t.type === 'income').length} giao dịch</small></article><article className="summary-card"><div className="card-heading"><span>Khoản chi tháng này</span><span className="icon coral">↘</span></div><strong className="coral-text">{money(expense)}</strong><small>{monthTransactions.filter((t) => t.type === 'expense').length} giao dịch</small></article></section>

    <div className="main-grid"><section className="panel form-panel"><div className="section-title"><div><p className="eyebrow">BẮT ĐẦU GHI</p><h2>{editingId ? 'Sửa giao dịch' : 'Thêm giao dịch'}</h2></div><span className="title-icon">＋</span></div><form onSubmit={saveTransaction}>
      <div className="segmented"><button type="button" className={form.type === 'expense' ? 'active expense-active' : ''} onClick={() => changeType('expense')}>− Chi tiền</button><button type="button" className={form.type === 'income' ? 'active income-active' : ''} onClick={() => changeType('income')}>＋ Thu tiền</button></div>
      <label className="field-label">Số tiền<input required min="1" type="number" inputMode="numeric" placeholder="Ví dụ: 50000" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></label>
      <div className="form-row"><label className="field-label">Danh mục<select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{categories[form.type].map((cat) => <option key={cat}>{cat}</option>)}</select></label><label className="field-label">Ngày<input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></label></div>
      <label className="field-label">Ghi chú <span className="optional">(không bắt buộc)</span><input placeholder="Khoản này dùng cho việc gì?" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} /></label>
      <button className="primary-button" type="submit">{editingId ? 'Lưu thay đổi' : 'Lưu giao dịch'} <span>→</span></button>{editingId && <button className="cancel-button" type="button" onClick={() => { setEditingId(null); setForm({ type: 'expense', amount: '', category: categories.expense[0] || '', date: today, note: '' }); }}>Hủy chỉnh sửa</button>}
    </form></section>

    <section className="panel transactions-panel"><div className="section-title"><div><p className="eyebrow">DÒNG TIỀN CỦA BẠN</p><h2>Giao dịch</h2></div><span className="count-pill">{visibleTransactions.length} khoản</span></div><div className="filter-row"><span>{month}</span><select aria-label="Lọc loại giao dịch" value={filterType} onChange={(e) => setFilterType(e.target.value)}><option value="all">Tất cả</option><option value="income">Khoản thu</option><option value="expense">Khoản chi</option></select></div>
      <div className="transaction-list">{visibleTransactions.length ? visibleTransactions.map((item) => <article className="transaction" key={item.id}><span className={`transaction-icon ${item.type}`}>{item.type === 'income' ? '↗' : '↘'}</span><div className="transaction-info"><b>{item.category}</b><span>{item.note || (item.type === 'income' ? 'Khoản thu' : 'Khoản chi')} · {new Date(`${item.date}T00:00:00`).toLocaleDateString('vi-VN')}</span></div><strong className={item.type === 'income' ? 'green-text' : ''}>{item.type === 'income' ? '+' : '−'}{money(item.amount)}</strong><div className="row-actions"><button title="Sửa" onClick={() => editTransaction(item)}>✎</button><button title="Xóa" onClick={() => deleteTransaction(item.id)}>×</button></div></article>) : <div className="empty-state"><span>◌</span><b>Chưa có giao dịch nào</b><small>Thêm khoản thu hoặc chi đầu tiên của bạn.</small></div>}</div>
    </section></div>

    <div className="bottom-grid"><section className="panel budget-panel"><div className="section-title"><div><p className="eyebrow">GIỮ CHI TIÊU TRONG TẦM KIỂM SOÁT</p><h2>Ngân sách tháng</h2></div><span className="title-icon">◷</span></div><div className="budget-numbers"><span>Đã chi <b>{money(expense)}</b></span><span>Ngân sách <b>{budget ? money(budget) : 'Chưa đặt'}</b></span></div><div className="progress-track"><div className={budgetPercent >= 100 ? 'progress-fill over' : 'progress-fill'} style={{ width: `${budgetPercent}%` }} /></div><p className="budget-caption">{budget ? (expense > budget ? `Bạn đã vượt ngân sách ${money(expense - budget)}.` : `Còn lại ${money(budget - expense)} trong tháng này.`) : 'Đặt ngân sách để theo dõi khoản chi trong tháng.'}</p><form className="budget-form" onSubmit={saveBudget}><input aria-label="Ngân sách tháng" type="number" min="0" placeholder="Nhập ngân sách (VNĐ)" value={budgetInput} onChange={(e) => setBudgetInput(e.target.value)} /><button type="submit">Lưu ngân sách</button></form></section>
      <section className="panel categories-panel"><div className="section-title"><div><p className="eyebrow">TÙY CHỈNH THEO CÁCH CỦA BẠN</p><h2>Danh mục</h2></div><span className="title-icon">▦</span></div><div className="category-columns">{['expense', 'income'].map((type) => <div key={type}><h3>{type === 'expense' ? 'Khoản chi' : 'Khoản thu'}</h3><div className="chips">{categories[type].map((cat) => <span className="chip" key={cat}>{cat}<button title={`Xóa ${cat}`} onClick={() => removeCategory(type, cat)}>×</button></span>)}</div><div className="add-category"><input aria-label={`Thêm danh mục ${type}`} placeholder="Tên danh mục mới" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCategory(type); } }} /><button onClick={() => addCategory(type)}>＋</button></div></div>)}</div></section></div>
    <footer>Được thiết kế để giúp bạn hiểu dòng tiền của mình <span>✳</span></footer>
  </main>;
}
