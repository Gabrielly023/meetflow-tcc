import React, { useState } from 'react'

const Header = ({ title = 'MeetFlow', links = [{ label: 'Home', href: '/' }, { label: 'Playlist', href: '/playlist' }], user, onLogout }) => {
	const [open, setOpen] = useState(false)

	return (
		<header className="mf-header">
			<div className="mf-header__inner">
				<div className="mf-brand">
					<button
						className="mf-menu-btn"
						onClick={() => setOpen((s) => !s)}
						aria-label="Menu"
						aria-expanded={open}
					>
						☰
					</button>
					<a href="/" className="mf-logo">
						{title}
					</a>
				</div>

				<nav className={`mf-nav ${open ? 'is-open' : ''}`} aria-label="Main navigation">
					<ul className="mf-nav__list">
						{links.map((l) => (
							<li key={l.href} className="mf-nav__item">
								<a href={l.href} className="mf-nav__link">
									{l.label}
								</a>
							</li>
						))}
						{user ? (
							<li className="mf-nav__item">
								<button className="mf-logout-btn" onClick={onLogout}>
									Sair
								</button>
							</li>
						) : null}
					</ul>
				</nav>
			</div>
		</header>
	)
}

export default Header

