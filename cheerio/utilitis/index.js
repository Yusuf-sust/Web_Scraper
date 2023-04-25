const formateNumber = (number) => {
    let value= number.split('').filter(digit => (digit >= '0' && digit <= '9')).join('');
    value = Number(value).toLocaleString("en-US");
    const identifier = number.split('').filter(ch => (/[a-zA-Z]/).test(ch)).join('');
    return `${value} ${identifier}`;
}

module.exports = {
    formateNumber,
}