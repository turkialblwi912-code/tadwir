/* Apply the saved theme before first paint to avoid a flash */
(function () { try { var t = localStorage.getItem('tadwir-theme'); if (t === 'dark' || t === 'light') document.documentElement.setAttribute('data-theme', t); } catch (e) {} })();
