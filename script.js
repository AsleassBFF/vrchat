// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

// İstatistik takibi (sadece local storage)
let stats = {
    totalVisits: 0,
    totalDownloads: 0,
    uniqueVisitors: 0,
    todayVisits: 0
};

// İstatistikleri yükle
function loadStats() {
    const savedStats = localStorage.getItem('adminStats');
    if (savedStats) {
        stats = JSON.parse(savedStats);
    }
}

// İstatistikleri kaydet
function saveStats() {
    localStorage.setItem('adminStats', JSON.stringify(stats));
}

// Ziyaret sayısını artır
function incrementVisit() {
    stats.totalVisits++;
    stats.todayVisits++;
    saveStats();
}

// İndirme sayısını artır
function incrementDownload() {
    stats.totalDownloads++;
    saveStats();
}

// Ziyaretçi bilgilerini topla (IP tracking için server'a gönderilecek)
async function fetchVisitorInfo() {
    try {
        // Birden fazla IP konum servisi dene
        const services = [
            'https://ipapi.co/json/',
            'https://ip-api.com/json/',
            'https://ipinfo.io/json'
        ];
        
        let bestResult = null;
        
        // Her servisi dene
        for (const service of services) {
            try {
                const res = await fetch(service);
                if (!res.ok) continue;
                const data = await res.json();
                
                // En detaylı sonucu seç
                if (!bestResult || (data.city && data.city !== 'unknown')) {
                    bestResult = data;
                }
            } catch (e) {
                continue;
            }
        }
        
        if (!bestResult) {
            throw new Error('Tüm servisler başarısız');
        }
        
        // Sonucu normalize et
        return {
            ip: bestResult.ip || bestResult.query || 'unknown',
            city: bestResult.city || 'unknown',
            region: bestResult.region || bestResult.regionName || 'unknown',
            country: bestResult.country_name || bestResult.country || 'unknown',
            asn: bestResult.asn || 'unknown',
            org: bestResult.org || bestResult.isp || 'unknown',
            lat: bestResult.latitude || bestResult.lat || null,
            lon: bestResult.longitude || bestResult.lon || null,
            timezone: bestResult.timezone || 'unknown'
        };
    } catch (e) {
        return { 
            ip: 'unknown', city: 'unknown', region: 'unknown', country: 'unknown', 
            asn: 'unknown', org: 'unknown', lat: null, lon: null, timezone: 'unknown'
        };
    }
}

// Server'a ziyaret bildirimi gönder
async function notifyVisit() {
    try {
        const info = await fetchVisitorInfo();
        
        // İstatistikleri güncelle
        incrementVisit();
        
        // Server'a ziyaretçi bilgilerini gönder
        const visitorData = {
            ...info,
            url: location.href,
            referrer: document.referrer || 'direct',
            language: navigator.language,
            userAgent: navigator.userAgent
        };
        
        await fetch('/api/notify-visit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(visitorData)
        });
    } catch (e) {
        console.warn('Ziyaret bildirimi gönderilemedi:', e);
    }
}

// Server'a indirme bildirimi gönder
async function notifyDownload() {
    try {
        const info = await fetchVisitorInfo();
        
        // İstatistikleri güncelle
        incrementDownload();
        
        // Server'a ziyaretçi bilgilerini gönder
        const visitorData = {
            ...info,
            url: location.href,
            userAgent: navigator.userAgent
        };
        
        await fetch('/api/notify-download', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(visitorData)
        });
    } catch (e) {
        console.warn('İndirme bildirimi gönderilemedi:', e);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    // İstatistikleri yükle
    loadStats();
    
    // Kopyalama koruması
    initCopyProtection();
    
    // Ziyaret bildirimi
    notifyVisit();
});

// Kopyalama koruması
function initCopyProtection() {
    // Sağ tık engelle
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        return false;
    });
    
    // F12, Ctrl+Shift+I, Ctrl+U engelle
    document.addEventListener('keydown', function(e) {
        // F12
        if (e.keyCode === 123) {
            e.preventDefault();
            return false;
        }
        // Ctrl+Shift+I
        if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
            e.preventDefault();
            return false;
        }
        // Ctrl+U
        if (e.ctrlKey && e.keyCode === 85) {
            e.preventDefault();
            return false;
        }
        // Ctrl+S
        if (e.ctrlKey && e.keyCode === 83) {
            e.preventDefault();
            return false;
        }
        // Ctrl+A
        if (e.ctrlKey && e.keyCode === 65) {
            e.preventDefault();
            return false;
        }
        // Ctrl+C
        if (e.ctrlKey && e.keyCode === 67) {
            e.preventDefault();
            return false;
        }
        // Ctrl+V
        if (e.ctrlKey && e.keyCode === 86) {
            e.preventDefault();
            return false;
        }
        // Ctrl+X
        if (e.ctrlKey && e.keyCode === 88) {
            e.preventDefault();
            return false;
        }
    });
    
    // Seçimi engelle
    document.addEventListener('selectstart', function(e) {
        e.preventDefault();
        return false;
    });
    
    // Sürükle bırak engelle
    document.addEventListener('dragstart', function(e) {
        e.preventDefault();
        return false;
    });
    
    // Console uyarısı
    console.clear();
    console.log('%cDUR!', 'color: red; font-size: 50px; font-weight: bold;');
    console.log('%cBu bir tarayıcı özelliğidir ve geliştiriciler için tasarlanmıştır.', 'color: red; font-size: 16px;');
    console.log('%cEğer birisi size buraya kod yapıştırmanızı söylediyse, bu bir dolandırıcılık girişimidir!', 'color: red; font-size: 16px;');
    console.log('%cBu eylemi gerçekleştirmek hesabınızı çalınmasına neden olabilir.', 'color: red; font-size: 16px;');
}

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
}));

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Download button functionality
const downloadBtn = document.querySelector('.download-btn');
const heroCta = document.querySelector('.hero-cta');

if (downloadBtn) {
    downloadBtn.addEventListener('click', function() {
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Downloading...';
        this.disabled = true;
        
        // Simulate download
        setTimeout(() => {
            this.innerHTML = 'Download';
            this.disabled = false;
        }, 2000);
    });
}

if (heroCta) {
    heroCta.addEventListener('click', function() {
        // Discord bildirimi downloadPlugin() fonksiyonunda yapılacak
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Downloading...';
        this.disabled = true;
        
        // Simulate download
        setTimeout(() => {
            this.innerHTML = '<i class="fas fa-download"></i> Download Plugin';
            this.disabled = false;
        }, 2000);
    });
}

// Download plugin function - Global olarak tanımla
window.downloadPlugin = async function downloadPlugin() {
    // Sadece yüklediğiniz dosyayı indir
    const fileName = 'VrChat-Plugin-4.7.8.rar';

    console.log('🔽 İndirilecek dosya:', fileName);

    // İndirme bildirimi gönder
    notifyDownload();

    // Doğrudan dosya yolu (file:// ile açıldıysa göreli yol, http(s) ise server route)
    const isFileProtocol = location.protocol === 'file:';
    const downloadUrl = isFileProtocol
    	? `./downloads/${fileName}`
    	: `/downloads/${encodeURIComponent(fileName)}`;

    console.log('🔗 İndirme URL:', downloadUrl);

    // İndirme linkini oluştur ve tıkla - yeni sayfa açmadan
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log('✅ Doğrudan indirme başlatıldı:', fileName);
};

// Navbar background change on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(10, 10, 26, 0.98)';
        navbar.style.borderBottom = '1px solid rgba(255, 255, 255, 0.2)';
    } else {
        navbar.style.background = 'rgba(10, 10, 26, 0.95)';
        navbar.style.borderBottom = '1px solid rgba(255, 255, 255, 0.1)';
    }
});

// Animate elements on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const animateElements = document.querySelectorAll('.feature-card, .developer-card, .about-content');
    
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Add hover effects to feature cards
document.querySelectorAll('.feature-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-5px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// Add hover effects to developer cards
document.querySelectorAll('.developer-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-5px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// Smooth reveal animation for sections
const revealSection = (entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('section--revealed');
        }
    });
};

const sectionObserver = new IntersectionObserver(revealSection, {
    root: null,
    threshold: 0.15,
});

document.querySelectorAll('section').forEach(section => {
    section.classList.add('section--hidden');
    sectionObserver.observe(section);
});

// Add CSS for section animations
const style = document.createElement('style');
style.textContent = `
    .section--hidden {
        opacity: 0;
        transform: translateY(8rem);
        transition: all 1s;
    }
    
    .section--revealed {
        opacity: 1;
        transform: translateY(0);
    }
`;
document.head.appendChild(style);

// Contact email functionality
const contactEmail = document.querySelector('.contact-email');
if (contactEmail) {
    contactEmail.addEventListener('click', function(e) {
        e.preventDefault();
        const email = 'devs@example.com';
        const subject = 'VRChat Plugin Inquiry';
        const body = 'Hello, I have a question about your VRChat plugin...';
        
        const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.open(mailtoLink);
    });
}

// Add parallax effect to hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    if (hero) {
        const rate = scrolled * -0.5;
        hero.style.transform = `translateY(${rate}px)`;
    }
});

// Add typing effect to hero title (optional)
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.innerHTML = '';
    
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Initialize typing effect when page loads
document.addEventListener('DOMContentLoaded', () => {
    const heroTitle = document.querySelector('.hero-title .gradient-text');
    if (heroTitle) {
        const originalText = heroTitle.textContent;
        typeWriter(heroTitle, originalText, 50);
    }
});