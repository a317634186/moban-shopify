const cartKey='pleasure-noir-cart';
const brandStyle=document.createElement('style');brandStyle.textContent='.brand img{width:34px;height:34px;object-fit:contain}.brand-name{font:600 16px Montserrat,sans-serif;letter-spacing:.08em;margin-left:9px;white-space:nowrap}.footer-brand{display:flex;align-items:center;margin-bottom:12px}.footer-brand img{width:34px;height:34px;object-fit:contain}';document.head.appendChild(brandStyle);
document.title='Velvet Secret — Pleasure for Every Body';
document.querySelectorAll('.brand img,.footer img').forEach(image=>image.alt='Velvet Secret');
const footerCopy=document.querySelector('.copyright');
if(footerCopy) footerCopy.textContent='© 2026 Velvet Secret · Pleasure for every body';
const brandLink=document.querySelector('.brand');
if(brandLink&&!brandLink.querySelector('.brand-name')){const name=document.createElement('span');name.className='brand-name';name.textContent='Velvet Secret';brandLink.appendChild(name)}
const footerLogo=document.querySelector('.footer-inner>div:first-child');
if(footerLogo&&!footerLogo.querySelector('.footer-brand')){const image=footerLogo.querySelector('img');if(image){const wrap=document.createElement('div');wrap.className='footer-brand';image.replaceWith(wrap);wrap.appendChild(image);const name=document.createElement('span');name.className='brand-name';name.textContent='Velvet Secret';wrap.appendChild(name)}}
const cartCount=document.querySelector('[data-cart-count]');
let cart=Number(localStorage.getItem(cartKey)||0);
function renderCart(){if(cartCount)cartCount.textContent=cart}
renderCart();
document.querySelector('[data-menu]')?.addEventListener('click',()=>document.querySelector('.nav')?.classList.toggle('open'));
document.querySelectorAll('.quick-add').forEach(button=>button.addEventListener('click',()=>{cart++;localStorage.setItem(cartKey,cart);renderCart();const old=button.textContent;button.textContent='Added to cart ✓';setTimeout(()=>button.textContent=old,1300)}));
document.querySelectorAll('[data-tabs] .tab').forEach(tab=>tab.addEventListener('click',()=>{document.querySelectorAll('[data-tabs] .tab').forEach(t=>t.classList.remove('active'));tab.classList.add('active')}));
document.querySelector('.signup')?.addEventListener('submit',event=>{event.preventDefault();const button=event.currentTarget.querySelector('button');button.textContent='Thank you ✓';event.currentTarget.querySelector('input').value=''});
