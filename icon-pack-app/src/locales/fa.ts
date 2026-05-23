import type { Translations } from "./en";

// Persian (فارسی) UI strings. Natural, modern, concise product writing —
// not literal machine translation. Technical tokens (SVG/PNG/JPEG/JSX/CSS/ZIP),
// icon names and style names stay in English on purpose.
export const fa: Translations = {
  // Toolbar
  "search.placeholder": "جستجوی آیکون‌ها",
  "nav.toggleCategories": "نمایش دسته‌بندی‌ها",
  download: "دانلود",
  "bulk.aria": "گزینه‌های دانلود گروهی",
  "bulk.selectedZip.label": "دانلود فایل ZIP آیکون‌های انتخاب‌شده",
  "bulk.selectedZip.count": "{n} مورد انتخاب‌شده",
  "bulk.selectedZip.empty": "آیکونی انتخاب نشده",
  "bulk.entirePack.label": "دانلود کل مجموعه",
  "bulk.entirePack.desc": "همه آیکون‌ها · استایل فعلی · SVG",
  "selection.selected": "انتخاب‌شده",
  "selection.clear": "پاک‌کردن انتخاب",
  "selection.bar.count": "{n} آیکون انتخاب‌شده",
  "selection.bar.download": "دانلود ZIP",
  "selection.bar.clear": "لغو انتخاب",
  "skipToContent": "رفتن به آیکون‌ها",

  // Sidebar
  "sidebar.categories": "دسته‌بندی‌ها",
  "sidebar.allIcons": "همه آیکون‌ها",
  "sidebar.tips": "نکته‌ها",
  "sidebar.tip.open": "روی هر آیکون بزنید تا کد و دانلودش را ببینید",
  "sidebar.tip.select": "برای انتخاب، نشانگر را روی آیکون ببرید",
  "sidebar.tip.esc": "برای بستن",

  // Empty state
  "empty.title": "آیکونی پیدا نشد",
  "empty.query": "چیزی برای «{query}» در استایل {style} پیدا نشد.",
  "empty.category": "هیچ آیکونی با استایل {style} در این دسته نیست.",

  // Detail panel
  "detail.close": "بستن",
  "detail.locked": "قفل‌شده",
  "control.style": "استایل",
  "control.size": "اندازه",
  "control.color": "رنگ",
  "detail.downloadAria": "دانلود {name}",
  "detail.copy": "کپی {tab}",
  "detail.copied": "کپی شد",

  // Download menu items
  "item.svg.label": "دانلود SVG",
  "item.svg.desc": "برای طراحی و توسعه وب (Figma، کد)",
  "item.png.label": "دانلود PNG",
  "item.png.desc": "برای اپ‌ها و ارائه‌ها (پس‌زمینه شفاف)",
  "item.jpeg.label": "دانلود JPEG",
  "item.jpeg.desc": "برای اسناد و عکس‌ها (پس‌زمینه سفید)",
  "item.all.label": "دانلود همه فرمت‌ها",
  "item.all.desc": "یک فایل .zip با SVG، PNG و JPEG",

  // Premium
  "premium.locked": "این آیکون فقط برای کاربران پریمیوم در دسترس است",
  "premium.badge": "پریمیوم",

  // Theme toggle
  "theme.toLight": "تغییر به حالت روشن",
  "theme.toDark": "تغییر به حالت تیره",
  "theme.light": "حالت روشن",
  "theme.dark": "حالت تیره",

  // Direction toggle
  "dir.toLtr": "تغییر به چیدمان چپ‌به‌راست",
  "dir.toRtl": "تغییر به چیدمان راست‌به‌چپ",
  "dir.ltr": "چیدمان چپ‌به‌راست",
  "dir.rtl": "چیدمان راست‌به‌چپ",

  // Tile
  "tile.select": "انتخاب {name}",
  "tile.copySvg": "کپی SVG",

  // Toasts
  "toast.downloaded": "{name} با فرمت {fmt} دانلود شد",
  "toast.downloadedAll": "{name} دانلود شد (SVG + PNG + JPEG)",
  "toast.downloadedZip": "{n} آیکون به‌صورت ZIP دانلود شد",
  "toast.noSelection": "آیکونی انتخاب نشده",
  "toast.exportFailed": "دانلود با خطا مواجه شد",
  "toast.copied": "کد {tab} کپی شد",
  "toast.clipboardError": "دسترسی به کلیپ‌بورد ممکن نیست",
};

// Display labels for icon categories, keyed by category slug (internal IDs
// stay in English). Falls back to the English manifest label if missing.
export const categoriesFa: Record<string, string> = {
  "basic-actions": "عملیات پایه",
  "basic-navigation": "ناوبری",
  "basic-search": "جستجو",
  "basic-system-feedback": "بازخورد سیستم",
  "basic-users": "کاربران",
  "content-managment": "مدیریت محتوا",
  shop: "فروشگاهی",
  "video-audio": "صوت و تصویر",
  "view-controls": "کنترل‌های نمایش",
  weather: "آب‌وهوا",
};
