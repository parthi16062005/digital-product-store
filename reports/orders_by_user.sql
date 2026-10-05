SELECT
    u.id AS user_id,
    u.name AS user_name,
    u.email,
    COUNT(o.id) AS total_orders,
    COALESCE(SUM(o.total_amount), 0) AS total_order_value
FROM users u
LEFT JOIN orders o
    ON u.id = o.user_id
GROUP BY
    u.id,
    u.name,
    u.email
ORDER BY total_order_value DESC;