const cards = document.querySelectorAll('.card');
let oldTime = [];

function updateTime() {
    const now = new Date();
    const time = [
        now.getHours().toString().padStart(2, '0'),
        now.getMinutes().toString().padStart(2, '0'),
        now.getSeconds().toString().padStart(2, '0')
    ].join('').split('');

    if (oldTime.length === 0) {
        oldTime = [...time];
        time.forEach((digit, i) => {
            cards[i].querySelectorAll('.card-face').forEach(face => {
                face.textContent = digit;
            });
        });
        return;
    }

    time.forEach((digit, i) => {
        if (digit !== oldTime[i]) {
            const card = cards[i];
            const front = card.querySelector('.front');
            const back = card.querySelector('.back');

            back.style.transform = 'rotateX(-180deg)';
            back.textContent = digit;

            void card.offsetWidth;
            card.classList.add('flip');
            card.addEventListener('transitionend', function handler(e) {
                if (e.propertyName === 'transform') {
                    front.textContent = digit;
                    card.classList.remove('flip');
                    back.style.transform = 'rotateX(-180deg)';
                    card.removeEventListener('transitionend', handler);
                }
            });
        }
    });

    oldTime = [...time];
}

setInterval(updateTime, 1000);
updateTime();