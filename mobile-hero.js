const menu = document.querySelector('#mobile-nav');
menu.addEventListener('click', event => { if (event.target.closest('a')) menu.hidePopover(); });
matchMedia('(max-width:767px)').addEventListener('change', () => menu.hidePopover());