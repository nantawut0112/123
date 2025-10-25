const platformData = [
  {
    id: "facebook",
    name: "Facebook",
    icon: "📘",
    color: "linear-gradient(135deg, #1877f2 0%, #145db8 100%)",
    description: "เพจ กลุ่ม และแคมเปญโฆษณา",
    channels: [
      { name: "เพจหลัก", meta: "facebook.com/brand" },
      { name: "Community Group", meta: "กลุ่มลูกค้าเอกซเรย์" },
      { name: "Event Page", meta: "งานเปิดตัวผลิตภัณฑ์" }
    ]
  },
  {
    id: "instagram",
    name: "Instagram",
    icon: "📸",
    color: "linear-gradient(135deg, #f58529 0%, #dd2a7b 50%, #8134af 100%)",
    description: "โพสต์ ฟีด และ Reels",
    channels: [
      { name: "IG: @brand.official", meta: "ฟีดหลัก" },
      { name: "IG Reels", meta: "วิดีโอสั้น" }
    ]
  },
  {
    id: "twitter",
    name: "X (Twitter)",
    icon: "🕊️",
    color: "linear-gradient(135deg, #14171a 0%, #374151 100%)",
    description: "บัญชีและรายการย่อย",
    channels: [
      { name: "@brand_news", meta: "ข่าวสาร" },
      { name: "@brand_support", meta: "ฝ่ายบริการลูกค้า" }
    ]
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: "💼",
    color: "linear-gradient(135deg, #0a66c2 0%, #004182 100%)",
    description: "เพจบริษัทและ Showcase",
    channels: [
      { name: "Company Page", meta: "ข่าวองค์กร" }
    ]
  },
  {
    id: "tiktok",
    name: "TikTok",
    icon: "🎵",
    color: "linear-gradient(135deg, #25f4ee 0%, #fe2c55 100%)",
    description: "Short-form Video",
    channels: []
  },
  {
    id: "pinterest",
    name: "Pinterest",
    icon: "📌",
    color: "linear-gradient(135deg, #bd081c 0%, #880515 100%)",
    description: "บอร์ดแรงบันดาลใจ",
    channels: []
  }
];

const MAX_CHANNEL_PER_PLATFORM = 50;

const platformListEl = document.querySelector("#platform-list");
const platformSearchEl = document.querySelector("#platform-search");
const platformTemplate = document.querySelector("#platform-card-template");
const channelTemplate = document.querySelector("#channel-item-template");
const dialogEl = document.querySelector("#channel-dialog");
const dialogCloseBtn = dialogEl.querySelector(".dialog-close");
const channelForm = document.querySelector("#channel-form");
const toastContainer = document.querySelector("#toast-container");
const createPostBtn = document.querySelector("#create-post");
const postForm = document.querySelector("#post-form");
const postPlatformSelect = document.querySelector("#post-platform");
const postChannelsContainer = document.querySelector("#post-channels");
const scheduledList = document.querySelector("#scheduled-posts");

let currentPlatformId = null;
let scheduledPosts = [];

function renderPlatforms(filter = "") {
  platformListEl.innerHTML = "";
  const normalizedFilter = filter.trim().toLowerCase();

  platformData
    .filter((platform) => {
      if (!normalizedFilter) return true;
      if (platform.name.toLowerCase().includes(normalizedFilter)) return true;
      return platform.channels.some((channel) =>
        `${channel.name} ${channel.meta}`.toLowerCase().includes(normalizedFilter)
      );
    })
    .forEach((platform) => {
      const node = platformTemplate.content.cloneNode(true);
      const card = node.querySelector(".platform-card");
      const iconEl = node.querySelector(".platform-icon");
      const nameEl = node.querySelector(".platform-name");
      const descriptionEl = node.querySelector(".platform-description");
      const countEl = node.querySelector(".channel-count");
      const channelListEl = node.querySelector(".channel-list");
      const addChannelBtn = node.querySelector(".add-channel");

      iconEl.textContent = platform.icon;
      iconEl.style.background = platform.color;
      nameEl.textContent = platform.name;
      descriptionEl.textContent = platform.description;
      countEl.textContent = `${platform.channels.length}/${MAX_CHANNEL_PER_PLATFORM} ช่อง`;

      if (platform.channels.length === 0) {
        const emptyMessage = document.createElement("div");
        emptyMessage.className = "channel-item";
        emptyMessage.innerHTML = `<div><strong>ยังไม่มีช่องทาง</strong><p>เริ่มเพิ่มช่องได้เลย</p></div>`;
        emptyMessage.querySelector("div").style.opacity = "0.65";
        emptyMessage.style.justifyContent = "center";
        emptyMessage.style.background = "rgba(108, 99, 255, 0.05)";
        emptyMessage.style.borderStyle = "dashed";
        channelListEl.append(emptyMessage);
      } else {
        platform.channels.forEach((channel, index) => {
          const channelNode = channelTemplate.content.cloneNode(true);
          const nameEl = channelNode.querySelector(".channel-name");
          const metaEl = channelNode.querySelector(".channel-meta");
          const removeBtn = channelNode.querySelector(".remove-channel");

          nameEl.textContent = channel.name;
          metaEl.textContent = channel.meta || "";
          removeBtn.addEventListener("click", () => removeChannel(platform.id, index));

          channelListEl.append(channelNode);
        });
      }

      addChannelBtn.addEventListener("click", () => openChannelDialog(platform.id));

      platformListEl.append(node);
    });

  renderPlatformSelect();
}

function openChannelDialog(platformId) {
  const platform = platformData.find((p) => p.id === platformId);
  if (!platform) return;

  if (platform.channels.length >= MAX_CHANNEL_PER_PLATFORM) {
    showToast(`แพลตฟอร์ม ${platform.name} มีช่องครบ ${MAX_CHANNEL_PER_PLATFORM} ช่องแล้ว`);
    return;
  }

  currentPlatformId = platformId;
  dialogEl.classList.remove("hidden");
  channelForm.reset();
  channelForm.querySelector("#channel-name").focus();
}

function closeDialog() {
  dialogEl.classList.add("hidden");
  currentPlatformId = null;
}

function addChannel(name, meta) {
  if (!currentPlatformId) return;

  const platform = platformData.find((p) => p.id === currentPlatformId);
  if (!platform) return;

  if (platform.channels.length >= MAX_CHANNEL_PER_PLATFORM) {
    showToast(`เพิ่มไม่สำเร็จ: ${platform.name} ถึงจำนวนสูงสุดแล้ว`);
    return;
  }

  platform.channels.push({ name, meta });
  closeDialog();
  renderPlatforms(platformSearchEl.value);
  showToast(`เพิ่มช่อง "${name}" ใน ${platform.name} แล้ว`);
}

function removeChannel(platformId, index) {
  const platform = platformData.find((p) => p.id === platformId);
  if (!platform) return;

  const [removed] = platform.channels.splice(index, 1);
  renderPlatforms(platformSearchEl.value);
  showToast(`ลบช่อง "${removed?.name ?? ""}" แล้ว`);
}

function renderPlatformSelect() {
  postPlatformSelect.innerHTML = "";

  platformData.forEach((platform) => {
    const option = document.createElement("option");
    option.value = platform.id;
    option.textContent = `${platform.name} (${platform.channels.length}/${MAX_CHANNEL_PER_PLATFORM})`;
    postPlatformSelect.append(option);
  });

  const firstPlatform = platformData[0];
  if (firstPlatform) {
    postPlatformSelect.value = firstPlatform.id;
    renderChannelCheckboxes(firstPlatform.id);
  }
}

function renderChannelCheckboxes(platformId) {
  const platform = platformData.find((p) => p.id === platformId);
  postChannelsContainer.innerHTML = "";

  if (!platform) {
    return;
  }

  if (platform.channels.length === 0) {
    const empty = document.createElement("p");
    empty.textContent = "ยังไม่มีช่องทาง กรุณาเพิ่มอย่างน้อย 1 ช่องก่อนจัดตาราง";
    empty.style.color = "var(--text-muted)";
    postChannelsContainer.append(empty);
    return;
  }

  platform.channels.forEach((channel, index) => {
    const id = `${platform.id}-channel-${index}`;
    const label = document.createElement("label");
    const checkbox = document.createElement("input");
    const text = document.createElement("span");
    const meta = document.createElement("small");

    checkbox.type = "checkbox";
    checkbox.value = channel.name;
    checkbox.id = id;

    text.textContent = channel.name;
    meta.textContent = channel.meta;
    meta.style.display = channel.meta ? "block" : "none";
    meta.style.color = "var(--text-muted)";

    label.setAttribute("for", id);
    label.append(checkbox, text, meta);
    postChannelsContainer.append(label);
  });
}

function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  toastContainer.append(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(10px)";
  }, 2700);

  setTimeout(() => {
    toast.remove();
  }, 3200);
}

function formatDateTime(date, time) {
  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "long",
    timeStyle: "short"
  }).format(new Date(`${date}T${time}`));
}

function handlePostSubmit(event) {
  event.preventDefault();

  const platformId = postPlatformSelect.value;
  const platform = platformData.find((p) => p.id === platformId);

  if (!platform) {
    showToast("กรุณาเลือกแพลตฟอร์ม");
    return;
  }

  const selectedChannels = Array.from(
    postChannelsContainer.querySelectorAll("input[type='checkbox']")
  )
    .filter((checkbox) => checkbox.checked)
    .map((checkbox) => checkbox.value);

  if (selectedChannels.length === 0) {
    showToast("กรุณาเลือกอย่างน้อย 1 ช่องทาง");
    return;
  }

  const content = document.querySelector("#post-content").value.trim();
  const date = document.querySelector("#post-date").value;
  const time = document.querySelector("#post-time").value;
  const media = document.querySelector("#post-media").value.trim();

  if (!content || !date || !time) {
    showToast("กรุณากรอกข้อมูลให้ครบถ้วน");
    return;
  }

  const scheduled = {
    id: crypto.randomUUID(),
    platform: platform.name,
    channels: selectedChannels,
    content,
    datetime: formatDateTime(date, time),
    media: media || null
  };

  scheduledPosts = [scheduled, ...scheduledPosts];
  renderScheduledPosts();

  postForm.reset();
  renderChannelCheckboxes(platformId);
  showToast("บันทึกโพสต์เข้าตารางแล้ว");
}

function renderScheduledPosts() {
  scheduledList.innerHTML = "";

  if (scheduledPosts.length === 0) {
    scheduledList.classList.add("empty");
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.innerHTML = '<span class="emoji">📝</span><p>ยังไม่มีงานที่จัดตารางไว้</p>';
    scheduledList.append(empty);
    return;
  }

  scheduledList.classList.remove("empty");

  scheduledPosts.forEach((post) => {
    const template = document.querySelector("#scheduled-card-template");
    const node = template.content.cloneNode(true);
    const platformEl = node.querySelector(".scheduled-platform");
    const datetimeEl = node.querySelector(".scheduled-datetime");
    const contentEl = node.querySelector(".scheduled-content");
    const countEl = node.querySelector(".scheduled-count");
    const channelListEl = node.querySelector(".scheduled-channels");
    const mediaLink = node.querySelector(".scheduled-media");

    platformEl.textContent = post.platform;
    datetimeEl.textContent = post.datetime;
    contentEl.textContent = post.content;
    countEl.textContent = `${post.channels.length} ช่อง`;

    post.channels.forEach((channel) => {
      const li = document.createElement("li");
      li.textContent = channel;
      channelListEl.append(li);
    });

    if (post.media) {
      mediaLink.href = post.media;
      mediaLink.textContent = "เปิดลิงก์สื่อแนบ";
      mediaLink.style.display = "inline";
    } else {
      mediaLink.remove();
    }

    scheduledList.append(node);
  });
}

function init() {
  renderPlatforms();
  platformSearchEl.addEventListener("input", (event) => {
    renderPlatforms(event.target.value);
  });

  dialogCloseBtn.addEventListener("click", closeDialog);
  dialogEl.addEventListener("click", (event) => {
    if (event.target === dialogEl) {
      closeDialog();
    }
  });

  channelForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = channelForm.querySelector("#channel-name").value.trim();
    const meta = channelForm.querySelector("#channel-meta").value.trim();

    if (!name) {
      showToast("กรุณากรอกชื่อช่องทาง");
      return;
    }

    addChannel(name, meta);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !dialogEl.classList.contains("hidden")) {
      closeDialog();
    }
  });

  postPlatformSelect.addEventListener("change", (event) => {
    renderChannelCheckboxes(event.target.value);
  });

  postForm.addEventListener("submit", handlePostSubmit);
  createPostBtn.addEventListener("click", () => {
    document.querySelector("#composer").scrollIntoView({ behavior: "smooth" });
  });

  if (platformData[0]) {
    const today = new Date();
    const dateInput = document.querySelector("#post-date");
    const timeInput = document.querySelector("#post-time");
    dateInput.valueAsDate = today;
    timeInput.value = `${String(today.getHours()).padStart(2, "0")}:${String(
      today.getMinutes()
    ).padStart(2, "0")}`;
  }
}

init();
