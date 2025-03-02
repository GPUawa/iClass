document.getElementById('saveOffset').addEventListener('click', () => {
    const offset = document.getElementById('timeOffset').value;
    localStorage.setItem('timeOffset', offset);
});