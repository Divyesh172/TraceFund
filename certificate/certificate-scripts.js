const form = document.getElementById('certificateForm');
const canvas = document.getElementById('certificateCanvas');
const ctx = canvas.getContext('2d');
const downloadBtn = document.getElementById('downloadBtn');

const donorNameInput = document.getElementById('donorName');
const donationAmountInput = document.getElementById('donationAmount');
const campaignNameInput = document.getElementById('campaignName');
const organizationNameInput = document.getElementById('organizationName');
const donationDateInput = document.getElementById('donationDate');

const today = new Date().toISOString().split('T')[0];
donationDateInput.value = today;

// ================= DRAW CERTIFICATE =================

function drawCertificate(data) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#F5F1E3';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawTopWaves();
    drawBottomWaves();
    drawMedal();

    // ===== BRAND NAME =====
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 36px "Times New Roman", serif';
    ctx.textAlign = 'center';
    ctx.fillText(data.organizationName.toUpperCase(), canvas.width / 2, 135);

    // ===== TITLE =====
    ctx.fillStyle = '#2d3748';
    ctx.font = 'bold 70px Inter';
    ctx.fillText('Certificate of Donation', canvas.width / 2, 240);

    ctx.fillStyle = '#4a5568';
    ctx.font = '24px Inter';
    ctx.fillText('This certificate is presented to', canvas.width / 2, 310);

    // ===== DONOR NAME =====
    ctx.fillStyle = '#2d3748';
    ctx.font = '72px Great Vibes';
    ctx.fillText(data.donorName || 'Donor Name', canvas.width / 2, 400);

    ctx.strokeStyle = '#2d3748';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(420, 420);
    ctx.lineTo(780, 420);
    ctx.stroke();

    // ===== MESSAGE (3 clean lines) =====
    ctx.font = '26px Playfair Display';
    ctx.fillStyle = '#4a5568';

    const recognitionText =
`In recognition of your generous contribution of $${data.donationAmount} to our ${data.campaignName}, your support has helped advance our mission and bring positive change and we sincerely thank you for making a meaningful difference.`;

    wrapText(ctx, recognitionText, canvas.width / 2, 540, 820, 42);

    // ===== DATE =====
    ctx.fillStyle = '#2d3748';
    ctx.font = 'bold 26px Inter';
    ctx.fillText(formatDate(data.donationDate), canvas.width / 2, 700);
}

// ================= DECORATIONS =================

function drawTopWaves() {
    const g = ctx.createLinearGradient(0, 0, canvas.width, 0);
    g.addColorStop(0, '#7c3aed');
    g.addColorStop(1, '#9333ea');

    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(canvas.width, 0);
    ctx.lineTo(canvas.width, 70);
    ctx.bezierCurveTo(canvas.width * 0.75, 50, canvas.width * 0.25, 90, 0, 70);
    ctx.closePath();
    ctx.fill();
}

function drawBottomWaves() {
    const g = ctx.createLinearGradient(0, canvas.height, canvas.width, canvas.height);
    g.addColorStop(0, '#7c3aed');
    g.addColorStop(1, '#9333ea');

    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(canvas.width, canvas.height - 70);
    ctx.bezierCurveTo(
        canvas.width * 0.75,
        canvas.height - 90,
        canvas.width * 0.25,
        canvas.height - 50,
        0,
        canvas.height - 70
    );
    ctx.closePath();
    ctx.fill();
}

function drawMedal() {
    const x = 1050;
    const y = 150;

    ctx.fillStyle = '#7c3aed';
    ctx.beginPath();
    ctx.arc(x, y, 60, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(x, y, 45, 0, Math.PI * 2);
    ctx.fill();
}

// ================= HELPERS =================

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    const lines = [];

    words.forEach(word => {
        const test = line + word + ' ';
        if (ctx.measureText(test).width > maxWidth) {
            lines.push(line);
            line = word + ' ';
        } else {
            line = test;
        }
    });

    lines.push(line);

    const startY = y - ((lines.length - 1) * lineHeight) / 2;
    lines.forEach((l, i) => ctx.fillText(l, x, startY + i * lineHeight));
}

function formatDate(date) {
    const d = new Date(date + 'T00:00:00');
    return `Awarded on ${d.getDate()} ${d.toLocaleString('en-US', { month: 'long' })} ${d.getFullYear()}`;
}

// ================= FORM =================

form.addEventListener('submit', e => {
    e.preventDefault();

    drawCertificate({
    donorName: donorNameInput.value,
    donationAmount: Number(donationAmountInput.value).toLocaleString(),
    campaignName: campaignNameInput.value,
    organizationName: organizationNameInput.value || 'Trace Fund',
    donationDate: donationDateInput.value
    });


    downloadBtn.style.display = 'flex';
});

downloadBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = `Certificate_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
});

// ================= INITIAL PREVIEW =================

drawCertificate({
    donorName: 'Donor Name',
    donationAmount: '000',
    campaignName: 'Your Campaign',
    organizationName: 'Trace Fund',
    donationDate: today
});
