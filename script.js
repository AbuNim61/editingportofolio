/* =========================================================
   CONFIG — edit these two lines to match your GitHub repo
   ========================================================= */
const GITHUB_USER = "AbuNim61";
const GITHUB_REPO  = "editingportofolio";
const GITHUB_BRANCH = "main";
const IMAGES_FOLDER = "images"; // folder in your repo holding portfolio images

/* =========================================================
   Auto-loading gallery
   Uses jsDelivr's free public CDN/API to list files in your
   GitHub repo's images folder — no login, no database, and
   (unlike GitHub's own API) a rate limit generous enough for
   real visitors. Just drag new images into that folder on
   github.com and they'll appear here automatically.
   ========================================================= */
const gallery = document.getElementById('gallery');
const countTag = document.getElementById('count-tag');

function makeTimecode(index){
  const h = String(Math.floor(index/3600)).padStart(2,'0');
  const m = String(Math.floor((index%3600)/60)).padStart(2,'0');
  const s = String(index%60).padStart(2,'0');
  return `${h}:${m}:${s}:00`;
}

function titleFromFilename(name){
  return name
    .replace(/\.[^/.]+$/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, c => c.toUpperCase());
}

async function loadGallery(){
  // jsDelivr's data API lists every file in the repo (flat list)
  const listUrl = `https://data.jsdelivr.com/v1/package/gh/${GITHUB_USER}/${GITHUB_REPO}@${GITHUB_BRANCH}/flat`;

  try{
    const res = await fetch(listUrl);
    if(!res.ok) throw new Error('Could not read repo file list');
    const data = await res.json();

    const prefix = `/${IMAGES_FOLDER}/`;
    const images = data.files
      .filter(f => f.name.startsWith(prefix) && /\.(jpe?g|png|gif|webp)$/i.test(f.name))
      .map(f => ({
        name: f.name.slice(prefix.length),
        // jsDelivr CDN URL — fast, cached, generous free rate limit
        url: `https://cdn.jsdelivr.net/gh/${GITHUB_USER}/${GITHUB_REPO}@${GITHUB_BRANCH}${f.name}`
      }));

    if(images.length === 0){
      gallery.innerHTML = `<div class="state-msg">No images yet — add files to /${IMAGES_FOLDER} on GitHub and refresh.</div>`;
      countTag.textContent = '0 pieces';
      return;
    }

    countTag.textContent = `${images.length} piece${images.length>1?'s':''}`;
    gallery.innerHTML = '';

    images.forEach((file, i) => {
      const el = document.createElement('div');
      el.className = 'frame';
      el.innerHTML = `
        <div class="thumb-box">
          <img src="${file.url}" alt="${titleFromFilename(file.name)}" loading="lazy">
        </div>
        <div class="meta">
          <span>${titleFromFilename(file.name)}</span>
          <span class="code">${makeTimecode(i)}</span>
        </div>
        <div class="scrub"></div>
      `;
      el.addEventListener('click', () => openLightbox(file.url, titleFromFilename(file.name)));
      gallery.appendChild(el);
    });
  }catch(err){
    gallery.innerHTML = `<div class="state-msg">Couldn't load images automatically. Check that GITHUB_USER and GITHUB_REPO are set correctly at the top of script.js, and that the "${IMAGES_FOLDER}" folder exists in your repo.</div>`;
    countTag.textContent = 'error';
    console.error(err);
  }
}

loadGallery();

/* Lightbox */
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
function openLightbox(src, alt){
  lightboxImg.src = src;
  lightboxImg.alt = alt;
  lightbox.classList.add('open');
}
document.getElementById('lightbox-close').addEventListener('click', () => lightbox.classList.remove('open'));
lightbox.addEventListener('click', (e) => { if(e.target === lightbox) lightbox.classList.remove('open'); });
document.addEventListener('keydown', (e) => { if(e.key === 'Escape') lightbox.classList.remove('open'); });
