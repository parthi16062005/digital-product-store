SELECT
    o.status AS order_status,
    COALESCE(p.status, 'NO PAYMENT') AS payment_status,
    COUNT(o.id) AS total_orders,
    COALESCE(SUM(o.total_amount), 0) AS total_amount
FROM orders o
LEFT JOIN payments p
    ON o.id = p.order_id
GROUP BY
    o.status,
    p.status
ORDER BY
    o.status,
    p.status;
    