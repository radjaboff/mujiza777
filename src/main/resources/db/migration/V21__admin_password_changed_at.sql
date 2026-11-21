-- Parol almashtirilganda shu vaqtdan oldingi JWT tokenlar qabul qilinmaydi.
-- NULL: hali parol almashtirilmagan hisoblarning joriy sessiyasi uzilmaydi.
ALTER TABLE admin_users
    ADD COLUMN password_changed_at TIMESTAMP;
