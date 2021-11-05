//placing server start in a different folder helps to lessen test interference
const {app} = require('./app');
const port = 3001;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
});