async function testSalesAPI() {
    try {
        const response = await fetch('http://localhost:9090/api/sales', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                items: [{ id: '1', name: 'Apple', price: 2.5, quantity: 2 }],
                total: 5,
                cashAmount: 10,
                change: 5
            })
        });

        const result = await response.json();
        console.log('API Response:', result);
    } catch (error) {
        console.error('Error:', error.message);
    }
}

testSalesAPI();
