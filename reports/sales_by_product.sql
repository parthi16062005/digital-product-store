
SELECT
    oi.product_id,
    oi.product_name,
    SUM(oi.quantity) AS total_quantity_sold,
    SUM(oi.price * oi.quantity) AS total_sales
FROM order_items oi
JOIN orders o
    ON oi.order_id = o.id
WHERE o.status = 'PAID'
GROUP BY
    oi.product_id,
    oi.product_name
ORDER BY total_sales DESC;