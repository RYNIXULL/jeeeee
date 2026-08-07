/* ============================================================
   SCRIPT.JS — Pure Vanilla JS, No Libraries
   ============================================================ */

'use strict';

// ─────────────────────────────────────────────
//  TOAST SYSTEM
// ─────────────────────────────────────────────
const Toast = (() => {
  const container = document.getElementById('toast-container');
  const queue = [];
  let active = null;

  function _svgIcon(type) {
    if (type === 'info') {
      return `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
    } else if (type === 'success') {
      return `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
    } else if (type === 'error') {
      return `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
    }
    return '';
  }

  function show(message, type = 'info', duration = 3000) {
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.innerHTML = _svgIcon(type) + `<span>${message}</span>`;
    container.appendChild(el);

    // Trigger show
    requestAnimationFrame(() => {
      requestAnimationFrame(() => { el.classList.add('show'); });
    });

    setTimeout(() => {
      el.classList.remove('show');
      setTimeout(() => { el.remove(); }, 450);
    }, duration);
  }

  return { show };
})();

// ─────────────────────────────────────────────
//  STARFIELD
// ─────────────────────────────────────────────
function buildStarfield() {
  const container = document.getElementById('starfield');
  if (!container) return;

  const W = window.innerWidth;
  const H = window.innerHeight;

  // Performance: fewer stars on small screens
  const total = W < 768 ? Math.min(Math.floor((W * H) / 5000), 15) : Math.min(Math.floor((W * H) / 3000), 380);
  const fragment = document.createDocumentFragment();

  const types = ['twinkle-slow', 'twinkle-fast', 'drift', 'blink'];
  const weights = [0.40, 0.25, 0.20, 0.15]; // probability weights

  function weightedRandom() {
    const r = Math.random();
    let cum = 0;
    for (let i = 0; i < weights.length; i++) {
      cum += weights[i];
      if (r < cum) return types[i];
    }
    return types[0];
  }

  for (let i = 0; i < total; i++) {
    const star = document.createElement('div');
    star.className = `star ${weightedRandom()}`;

    const size = Math.random() < 0.08
      ? (Math.random() * 2.2 + 1.8)   // rare large stars
      : (Math.random() * 1.4 + 0.4);  // common small stars

    const x = Math.random() * 100;
    const y = Math.random() * 100;
    const dur = (Math.random() * 5 + 2).toFixed(1) + 's';
    const delay = -(Math.random() * 8) + 's';
    const opFrom = (Math.random() * 0.3 + 0.05).toFixed(2);
    const opTo = (Math.random() * 0.6 + 0.35).toFixed(2);
    const driftDur = (Math.random() * 30 + 20).toFixed(0) + 's';

    const dx = ['dx1','dx2','dx3'].map(() => (Math.random() * 8 - 4).toFixed(1) + 'px');
    const dy = ['dy1','dy2','dy3'].map(() => (Math.random() * 8 - 4).toFixed(1) + 'px');

    star.style.cssText = `
      width:${size}px; height:${size}px;
      top:${y}%; left:${x}%;
      opacity:${opFrom};
      --dur:${dur};
      --delay:${delay};
      --op-from:${opFrom};
      --op-to:${opTo};
      --drift-dur:${driftDur};
      --dx1:${dx[0]}; --dy1:${dy[0]};
      --dx2:${dx[1]}; --dy2:${dy[1]};
      --dx3:${dx[2]}; --dy3:${dy[2]};
    `;

    fragment.appendChild(star);
  }

  container.appendChild(fragment);
}

// ─────────────────────────────────────────────
//  PROGRESS DOTS
// ─────────────────────────────────────────────
function updateDots(index) {
  document.querySelectorAll('#progress-dots .dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === index);
  });
}

// ─────────────────────────────────────────────
//  SLIDE SYSTEM
// ─────────────────────────────────────────────
const Slider = (() => {
  const container = document.getElementById('slides-container');
  let current = 0;
  let isAnimating = false;

  function goTo(index) {
    if (isAnimating || index === current || index < 0 || index > 3) return;

    const slides = document.querySelectorAll('.slide');
    slides.forEach(s => {
      s.style.visibility = 'visible';
    });

    isAnimating = true;
    container.classList.add('animating');
    current = index;

    container.style.transform = `translateX(-${index * 25}%)`;
    updateDots(index);

    // Slide 2: autoplay video
    if (index === 1) {
      document.body.classList.add('video-active');
      triggerVideoPlay();
    } else {
      document.body.classList.remove('video-active');
      pauseVideo();
    }

    // Slide 3: animate envelope scene entrance and play BGM
    const bgm = document.getElementById('bgm-slide3');
    if (index === 2) {
      setTimeout(() => {
        animateSlide3Entrance();
        if (bgm) {
          bgm.volume = 0;
          bgm.play().catch(() => {});
          // Fade in audio slowly
          let vol = 0;
          const fade = setInterval(() => {
            if (vol < 1.0) {
              vol += 0.05;
              bgm.volume = Math.min(vol, 1.0);
            } else {
              clearInterval(fade);
            }
          }, 200);
        }
      }, 400);
    } else if (bgm) {
      bgm.pause();
    }

    // Slide 4: play BGM
    const bgm4 = document.getElementById('bgm-slide4');
    if (index === 3) {
      setTimeout(() => {
        if (bgm4) {
          bgm4.volume = 0;
          bgm4.play().catch(() => {});
          let vol = 0;
          const fade = setInterval(() => {
            if (vol < 1.0) {
              vol += 0.05;
              bgm4.volume = Math.min(vol, 1.0);
            } else {
              clearInterval(fade);
            }
          }, 200);
        }
      }, 400);

      // Start typing animation
      if (!window.poemTyped) {
        window.poemTyped = true;
        setTimeout(typePoem, 1000);
      }
    } else if (bgm4) {
      bgm4.pause();
    }

    const duration = 1150;
    setTimeout(() => {
      isAnimating = false;
      container.classList.remove('animating');
    }, duration);
  }

  function getCurrent() { return current; }

  return { goTo, getCurrent };
})();

// ─────────────────────────────────────────────
//  POEM TYPING ANIMATION
// ─────────────────────────────────────────────
function typePoem() {
  const titleEl = document.getElementById('poem-title');
  const contentEl = document.getElementById('poem-content');
  if (!titleEl || !contentEl) return;
  
  const titleText = "Di Antara Yang Tetap Ada";
  const lines = [
    "Kelak, jika langkahmu membutuhkan reda,",
    "aku masih di sini, di tempat yang sama.",
    "Tak pernah beranjak, tak pernah berjarak,",
    "menjadi jeda dari riuh yang tak lagi kau kehendak.",
    "",
    "Aku hidup di antara kata dan pena,",
    "merawat kisah yang dieja wujudnya.",
    "Aku bersumpah pada laut dan ombak,",
    "pada langit dan awan yang berpelak.",
    "",
    "Aku menyelinap di antara rimba rerumputan,",
    "di mana kucing-kucing lelap dalam kehangatan.",
    "Juga di sela-sela kenang yang kian tertimbun masa,",
    "di sana aku bertahan, menjaga rasa.",
    "",
    "Maka kembalilah, kapan pun kau ingin menyapa,",
    "pintu ini tak pernah terkunci oleh jeda.",
    "Aku akan senantiasa menunggu di ujung petang,",
    "dengan senyum yang tak lekang,",
    "dan hati yang tak pernah berhenti mencinta."
  ];

  let titleIndex = 0;
  let lineIndex = 0;
  let charIndex = 0;
  let currentP = null;
  
  const cursor = document.createElement('span');
  cursor.textContent = '|';
  cursor.style.animation = 'blink 1s step-end infinite';
  
  // Start with blinking cursor on title
  titleEl.appendChild(cursor);

  function typeTitle() {
    if (titleIndex < titleText.length) {
      const isMobile = window.innerWidth < 768;
      const charsToType = isMobile ? Math.min(2, titleText.length - titleIndex) : 1;
      
      const chunk = titleText.substring(titleIndex, titleIndex + charsToType);
      const textNode = document.createTextNode(chunk);
      titleEl.insertBefore(textNode, cursor);
      
      if (chunk.trim() !== '') playTypingSound();
      titleIndex += charsToType;
      
      let delay = 135; // Slower base speed for title
      if (chunk.endsWith(' ')) delay = 280; // Pause on space
      
      setTimeout(typeTitle, delay);
    } else {
      setTimeout(() => {
        if (cursor.parentNode) cursor.parentNode.removeChild(cursor);
        typeContent();
      }, 600);
    }
  }

  function typeContent() {
    if (lineIndex >= lines.length) {
      if (cursor.parentNode) cursor.parentNode.removeChild(cursor);
      return; 
    }
    
    const currentLine = lines[lineIndex];
    
    if (currentLine === "") {
      lineIndex++;
      charIndex = 0;
      setTimeout(typeContent, 500);
      return;
    }
    
    if (charIndex === 0 && (lineIndex === 0 || lines[lineIndex - 1] === "")) {
      currentP = document.createElement('p');
      contentEl.appendChild(currentP);
      currentP.appendChild(cursor);
    } else if (charIndex === 0) {
      const br = document.createElement('br');
      currentP.insertBefore(br, cursor);
    }
    
    if (charIndex < currentLine.length) {
      const isMobile = window.innerWidth < 768;
      // Batch up to 3 chars at a time on mobile to reduce DOM thrashing
      const charsToType = isMobile ? Math.min(3, currentLine.length - charIndex) : 1;
      
      const chunk = currentLine.substring(charIndex, charIndex + charsToType);
      const txt = document.createTextNode(chunk);
      currentP.insertBefore(txt, cursor);
      
      // Limit sound frequency on mobile
      if (chunk.trim() !== '' && (!isMobile || charIndex % 2 === 0)) {
        playTypingSound();
      }
      
      charIndex += charsToType;
      
      let delay = 115; // Base speed for body
      if (chunk.endsWith(' ')) delay = 250; // Pause on space
      if (chunk.endsWith(',') || chunk.endsWith('.')) delay = 450; // Longer pause on punctuation
      
      setTimeout(typeContent, delay);
    } else {
      charIndex = 0;
      lineIndex++;
      setTimeout(typeContent, 300);
    }
  }

  typeTitle();
}

// ─────────────────────────────────────────────
//  VIDEO (YouTube iframe integration)
// ─────────────────────────────────────────────
const videoEl = document.getElementById('main-video');

function triggerVideoPlay() {
  if (!videoEl || videoEl.tagName.toLowerCase() !== 'iframe') return;

  // ── Freeze everything to free GPU for video ──
  const starfield = document.getElementById('starfield');
  if (starfield) starfield.style.display = 'none';
  
  // Freeze slider transforms so GPU doesn't composite a 400vw canvas
  const slidesContainer = document.getElementById('slides-container');
  if (slidesContainer) {
    slidesContainer.style.willChange = 'auto';
    slidesContainer.style.transform = 'none';
  }

  // Play YouTube via postMessage API
  try {
    videoEl.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'playVideo', args: [] }), '*');
  } catch (e) {
    console.error('Cannot play YouTube iframe:', e);
  }
}

function pauseVideo() {
  if (!videoEl || videoEl.tagName.toLowerCase() !== 'iframe') return;
  
  // Pause YouTube via postMessage API
  try {
    videoEl.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }), '*');
  } catch (e) {
    console.error('Cannot pause YouTube iframe:', e);
  }

  // ── Restore everything when video exits ──
  const starfield = document.getElementById('starfield');
  if (starfield) starfield.style.display = '';
  
  const slidesContainer = document.getElementById('slides-container');
  if (slidesContainer) {
    slidesContainer.style.willChange = 'transform';
    // Re-apply correct slide position (slide-2 = index 1 = -25%)
    slidesContainer.style.transform = 'translateX(-25%)';
  }
}

// ─────────────────────────────────────────────
//  RIPPLE EFFECT
// ─────────────────────────────────────────────
function addRipple(btn, e) {
  const rect = btn.getBoundingClientRect();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;
  const x = clientX - rect.left;
  const y = clientY - rect.top;
  const size = Math.max(rect.width, rect.height);

  const ripple = document.createElement('span');
  ripple.className = 'ripple';
  ripple.style.cssText = `
    width:${size}px; height:${size}px;
    left:${x - size / 2}px; top:${y - size / 2}px;
  `;
  btn.appendChild(ripple);
  setTimeout(() => ripple.remove(), 700);
}

// ─────────────────────────────────────────────
//  SLIDE 3: ENVELOPE
// ─────────────────────────────────────────────
let slide3Entered = false;

function animateSlide3Entrance() {
  if (slide3Entered) return;
  slide3Entered = true;
  const scene = document.querySelector('.envelope-scene');
  if (!scene) return;
  scene.style.opacity = '0';
  scene.style.transform = 'scale(0.9) translateY(20px)';
  scene.style.transition = 'opacity 800ms ease, transform 800ms cubic-bezier(0.34,1.56,0.64,1)';
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      scene.style.opacity = '1';
      scene.style.transform = '';
    });
  });
}

function initEnvelope() {
  const scene = document.querySelector('.envelope-scene');
  if (!scene) return;

  let isOpen = false;
  let overflowTimer = null;

  function playPaperSound() {
    const snd = document.getElementById('open-sound');
    if (snd) {
      snd.currentTime = 0;
      snd.play().catch(() => {});
    }
  }

  function openEnvelope() {
    if (isOpen) return;
    isOpen = true;
    scene.classList.add('is-open');
    playPaperSound();
    scene.setAttribute('aria-label', 'Amplop terbuka — gulir untuk membaca surat');
  }

  function closeEnvelope() {
    if (!isOpen) return;
    isOpen = false;
    scene.classList.remove('is-open');
    playPaperSound();
    scene.setAttribute('aria-label', 'Klik untuk membuka amplop');
  }


  scene.addEventListener('click', (e) => {
    addRipple(scene, e);
    if (!isOpen) {
      openEnvelope();
    } else {
      closeEnvelope();
    }
  });

  scene.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!isOpen) openEnvelope();
      else closeEnvelope();
    }
  });
}

// ─────────────────────────────────────────────
//  BUTTON EVENTS
// ─────────────────────────────────────────────
let clickAudioBuffer = null;
let typingAudioBuffer = null;
let typingGainNode = null;
const clickCtx = new (window.AudioContext || window.webkitAudioContext)();

let audioInitialized = false;

function initAudio() {
  if (audioInitialized) return;
  audioInitialized = true;
  if (clickCtx.state === 'suspended') clickCtx.resume();
  
  fetch('photos-click-409642.mp3')
    .then(res => res.arrayBuffer())
    .then(data => clickCtx.decodeAudioData(data))
    .then(buffer => {
      clickAudioBuffer = buffer;
    })
    .catch(err => console.log('Error loading click sound', err));

  fetch('ncprime-keyboard-typing-one-short-292592.mp3')
    .then(res => res.arrayBuffer())
    .then(data => clickCtx.decodeAudioData(data))
    .then(buffer => {
      typingAudioBuffer = buffer;
      typingGainNode = clickCtx.createGain();
      typingGainNode.gain.value = 0.15; // Lower volume for typing
      typingGainNode.connect(clickCtx.destination);
    })
    .catch(err => console.log('Error loading typing sound', err));
}

function playClickSound() {
  if (!audioInitialized) initAudio();
  if (clickAudioBuffer) {
    if (clickCtx.state === 'suspended') clickCtx.resume();
    const source = clickCtx.createBufferSource();
    source.buffer = clickAudioBuffer;
    source.connect(clickCtx.destination);
    // Lewati 0.04 detik pertama untuk memotong 'silence' bawaan dari encoding MP3 lebih agresif
    source.start(0, 0.04);
  }
}

function playTypingSound() {
  if (typingAudioBuffer && typingGainNode) {
    if (clickCtx.state === 'suspended') clickCtx.resume();
    const source = clickCtx.createBufferSource();
    source.buffer = typingAudioBuffer;
    source.connect(typingGainNode);
    // You can adjust volume if needed by connecting to a GainNode
    source.start(0);
  }
}

function initButtons() {
  function bindBtn(id, targetSlide) {
    const btn = document.getElementById(id);
    if (btn) {
      // Visual dan suara dipicu langsung saat disentuh/ditekan (bukan saat dilepas)
      btn.addEventListener('pointerdown', (e) => {
        addRipple(btn, e);
        playClickSound();
      });
      
      // Navigasi halaman tetap menunggu sampai jari/mouse diangkat (click)
      btn.addEventListener('click', (e) => {
        setTimeout(() => Slider.goTo(targetSlide), 100); // jeda dikurangi agar lebih gesit
      });
    }
  }

  bindBtn('btn-hello', 1);
  bindBtn('btn-next', 2);
  bindBtn('btn-prev-1', 0);
  bindBtn('btn-prev-2', 1);
  bindBtn('btn-next-4', 3);
  bindBtn('btn-prev-3', 2);
}

// ─────────────────────────────────────────────
//  PREVENT SCROLL / ZOOM
// ─────────────────────────────────────────────
function lockPage() {
  document.body.classList.add('no-scroll');
  // Removed touchmove preventDefault to allow inner scrolling
  document.addEventListener('gesturestart', (e) => e.preventDefault());
  document.addEventListener('gesturechange', (e) => e.preventDefault());
}

// ─────────────────────────────────────────────
//  INIT
// ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  lockPage();
  buildStarfield();
  initButtons();
  initEnvelope();
  updateDots(0);

  // Initial slide entrance
  const slide1Content = document.getElementById('btn-hello');
  if (slide1Content) {
    slide1Content.style.opacity = '0';
    slide1Content.style.transform = 'scale(0.92) translateY(12px)';
    slide1Content.style.transition = 'opacity 1000ms 400ms ease, transform 1000ms 400ms cubic-bezier(0.34,1.56,0.64,1)';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        slide1Content.style.opacity = '1';
        slide1Content.style.transform = '';
      });
    });
  }

  // Rebuild starfield on resize (debounced)
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const sf = document.getElementById('starfield');
      if (sf) {
        sf.innerHTML = '';
        buildStarfield();
      }
    }, 400);
  });

  // ─────────────────────────────────────────────
  //  WEB BOT WIDGET & CHAT LOGIC
  // ─────────────────────────────────────────────
  let NVIDIA_API_KEY = "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";
  
  const botWidget = document.getElementById('web-bot-widget');
  const botAvatar = document.getElementById('bot-avatar');
  const botMessage = document.getElementById('bot-message');
  const chatPanel = document.getElementById('bot-chat-panel');
  const btnCloseChat = document.getElementById('btn-close-chat');
  const chatMessages = document.getElementById('chat-messages');
  const chatInput = document.getElementById('chat-input');
  const btnSendChat = document.getElementById('btn-send-chat');

  let chatHistory = [
    { role: "system", content: "Anda adalah Jean, asisten AI yang ramah, sopan, puitis, dan pintar. Anda adalah teman ngobrol untuk Jee. Jika ditanya siapa atau apa itu Jean, jawablah persis dengan kalimat ini: 'Haii jee, aku Jean, simbol dari dua nama yang saling menautkan rasa. Aku adalah bisikan dari masa lalu dan harapan di masa depan. Di sini, di antara jeda dan kata, aku ada untuk mendengarkan setiap sudut kisahmu.'" },
    { role: "assistant", content: "Hai Jee, aku Jean. Ada yang bisa aku bantu hari ini?" }
  ];

  if (botWidget && botAvatar && botMessage && chatPanel) {
    // Tampilkan bubble singkat di awal
    botMessage.textContent = "Hai, Jee! Aku Jean. Klik aku untuk ngobrol!";
    setTimeout(() => {
      botWidget.classList.add('active');
      setTimeout(() => {
        botWidget.classList.remove('active');
      }, 4000);
    }, 1500);

    // Eye tracking logic
    const robotEyes = document.getElementById('robot-eyes');
    window.addEventListener('mousemove', (e) => {
      if (!robotEyes) return;
      const rect = botAvatar.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;
      const angle = Math.atan2(deltaY, deltaX);
      const distance = Math.min(Math.hypot(deltaX, deltaY) / 10, 4); // Max 4px movement
      
      const moveX = Math.cos(angle) * distance;
      const moveY = Math.sin(angle) * distance;
      
      robotEyes.style.transform = `translate(${moveX}px, ${moveY}px)`;
    });

    // Drag and Drop + Click logic
    let isDragging = false;
    let startX, startY, initialLeft, initialTop;
    
    botAvatar.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      isDragging = false;
      startX = e.clientX;
      startY = e.clientY;
      
      const rect = botWidget.getBoundingClientRect();
      initialLeft = rect.left;
      initialTop = rect.top;

      botAvatar.style.cursor = 'grabbing';
      document.addEventListener('pointermove', onPointerMove);
      document.addEventListener('pointerup', onPointerUp);
    });

    function onPointerMove(e) {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      
      if (Math.hypot(dx, dy) > 5) {
        isDragging = true;
      }
      
      if (isDragging) {
        botWidget.style.left = `${initialLeft + dx}px`;
        botWidget.style.top = `${initialTop + dy}px`;
        botWidget.style.right = 'auto';
        botWidget.style.bottom = 'auto';
      }
    }

    function onPointerUp(e) {
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', onPointerUp);
      botAvatar.style.cursor = 'pointer';

      // Jika tidak didrag berarti di-klik -> Buka panel chat
      if (!isDragging) {
        playClickSound();
        botWidget.classList.remove('active');
        toggleChatPanel();
      }
    }

    function toggleChatPanel() {
      if (chatPanel.classList.contains('hidden')) {
        chatPanel.classList.remove('hidden');
        chatPanel.setAttribute('aria-hidden', 'false');
        botAvatar.style.display = 'none'; // Sembunyikan avatar saat chat terbuka
        setTimeout(() => chatInput.focus(), 100);
      } else {
        chatPanel.classList.add('hidden');
        chatPanel.setAttribute('aria-hidden', 'true');
        botAvatar.style.display = ''; // Tampilkan kembali avatar
      }
    }

    btnCloseChat.addEventListener('click', () => {
      playClickSound();
      toggleChatPanel();
    });

    function escapeHTML(str) {
      return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
          }[tag]));
    }

    function appendMessage(role, text) {
      const msgDiv = document.createElement('div');
      msgDiv.className = `chat-message ${role}`;
      msgDiv.innerHTML = `<div class="msg-content">${escapeHTML(text)}</div>`;
      chatMessages.appendChild(msgDiv);
      chatMessages.scrollTop = chatMessages.scrollHeight;
      return msgDiv;
    }

    async function sendChatMessage() {
      const text = chatInput.value.trim();
      if (!text) return;

      if (!NVIDIA_API_KEY || NVIDIA_API_KEY === "YOUR_NVIDIA_API_KEY_HERE") {
        const userKey = prompt("Silakan masukkan NVIDIA API Key Anda untuk menggunakan Chatbot:");
        if (userKey && userKey.trim() !== "") {
          NVIDIA_API_KEY = userKey.trim();
          localStorage.setItem('NVIDIA_API_KEY', NVIDIA_API_KEY);
        } else {
          Toast.show("API Key diperlukan untuk menggunakan chatbot", "error", 4000);
          return;
        }
      }

      playClickSound();
      appendMessage('user', text);
      chatHistory.push({ role: "user", content: text });
      chatInput.value = '';
      
      const typingDiv = document.createElement('div');
      typingDiv.className = 'typing-indicator';
      typingDiv.innerHTML = '<span></span><span></span><span></span>';
      chatMessages.appendChild(typingDiv);
      chatMessages.scrollTop = chatMessages.scrollHeight;

      try {
        const response = await fetch("http://localhost:3002/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${NVIDIA_API_KEY}`
          },
          body: JSON.stringify({
            model: "google/diffusiongemma-26b-a4b-it",
            messages: chatHistory,
            temperature: 1,
            top_p: 0.95,
            max_tokens: 16384,
            stream: true,
            extra_body: {
              chat_template_kwargs: { enable_thinking: true },
              reasoning_budget: 16384
            }
          })
        });

        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }

        chatMessages.removeChild(typingDiv);
        
        // Setup wadah untuk bot message (bisa berisi reasoning & content)
        const botMsgDiv = document.createElement('div');
        botMsgDiv.className = 'chat-message assistant';
        
        const outerContent = document.createElement('div');
        outerContent.className = 'msg-content';
        botMsgDiv.appendChild(outerContent);
        chatMessages.appendChild(botMsgDiv);
        
        let reasoningDiv = null;
        let contentDiv = document.createElement('div');
        outerContent.appendChild(contentDiv);
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let fullContent = "";
        let fullReasoning = "";
        let isDone = false;

        while (!isDone) {
          const { value, done } = await reader.read();
          if (done) break;
          
          const chunkStr = decoder.decode(value, { stream: true });
          const lines = chunkStr.split("\n").filter(line => line.trim().startsWith("data: "));
          
          for (const line of lines) {
            const dataStr = line.replace("data: ", "").trim();
            if (dataStr === "[DONE]") {
              isDone = true;
              break;
            }
            try {
              const data = JSON.parse(dataStr);
              if (data.error) {
                Toast.show("API NVIDIA Error: " + (data.error.message || "Gagal memproses"), "error", 6000);
                contentDiv.innerHTML = `<span style="color: #ff6b6b; font-style: italic;">[API Rate Limit/Error: ${data.error.message || 'Unknown'}]</span>`;
                break;
              }
              if (data.choices && data.choices[0].delta) {
                const delta = data.choices[0].delta;
                
                // Tangani reasoning
                if (delta.reasoning_content) {
                  if (!reasoningDiv) {
                    reasoningDiv = document.createElement('div');
                    reasoningDiv.className = 'msg-reasoning';
                    outerContent.insertBefore(reasoningDiv, contentDiv);
                  }
                  fullReasoning += delta.reasoning_content;
                  reasoningDiv.innerText = fullReasoning;
                  chatMessages.scrollTop = chatMessages.scrollHeight;
                }
                
                // Tangani konten utama
                if (delta.content !== null && delta.content !== undefined) {
                  fullContent += delta.content;
                  contentDiv.innerText = fullContent;
                  chatMessages.scrollTop = chatMessages.scrollHeight;
                }
              }
            } catch (e) {
              // Abaikan jika tidak bisa diparse (e.g., chunk terpotong - walau fetch API JS jarang memotong JSON line jika diproses per baris)
            }
          }
        }
        
        chatHistory.push({ role: "assistant", content: fullContent });

      } catch (err) {
        console.error(err);
        if(chatMessages.contains(typingDiv)) chatMessages.removeChild(typingDiv);
        Toast.show("Gagal menghubungi server bot", "error", 4000);
      }
    }

    btnSendChat.addEventListener('click', sendChatMessage);
    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendChatMessage();
    });
  }
});
