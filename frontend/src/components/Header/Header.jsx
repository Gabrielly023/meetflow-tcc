import React, { useState } from 'react'

const Header = ({ title = 'MeetFlow', links = [{ label: 'Home', href: '/' }, { label: 'Playlist', href: '/playlist' }], user, onLogout }) => {
	const [open, setOpen] = useState(false)

	return (
	<header className="text-gray-400 bg-gradient-to-r from-purple-500 via-pink-500 via-orange-900 to-green-500 body-font">
  <div className="container mx-auto flex flex-wrap p-5 flex-col md:flex-row items-center">
    <a className="flex title-font font-medium items-center text-white mb-4 md:mb-0">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" className="w-10 h-10 text-white p-2 bg-indigo-500 rounded-full" viewBox="0 0 24 24">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
      </svg>
      <span className="ml-3 text-xl">{title}</span>
    </a>
    <nav className="md:ml-auto flex flex-wrap items-center text-base justify-center">
      {links.map((link, index) => (
        <a key={index} href={link.href} className="mr-5 hover:text-white">
          {link.label}
        </a>
      ))}
    </nav>
    {user && (
      <div className="flex items-center">
        <span className="text-white mr-4">{user.name}</span>
        <button onClick={onLogout} className="inline-flex items-center bg-gray-800 border-0 py-1 px-3 focus:outline-none hover:bg-gray-700 rounded text-base mt-4 md:mt-0">
          Logout
        </button>
      </div>
    )}
  </div>
</header>
	)
}

export default Header

//roxo rosa laranja verde