import useAuthStore from '../../stores/authStore'

export default function Navbar({ onLogout }) {
  const user     = useAuthStore(s => s.user)
  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '??'

  return (
    <div className="flex items-center justify-between px-5 pt-5 pb-3 font-nunito">

      {/* Logo */}
      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#9b87f5] to-[#7c6af7] flex items-center justify-center clay-icon-purple">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L6 8h4v6H8l4 8 4-8h-2V8h4L12 2z" fill="white" />
        </svg>
      </div>

      {/* Title */}
      <span className="text-lg font-black text-[#3d2f8a]">PayMe</span>

      {/* Avatar — tap untuk logout */}
      <button
        onClick={onLogout}
        title="Logout"
        className="w-10 h-10 rounded-full bg-gradient-to-br from-[#f9a8d4] to-[#f472b6] flex items-center justify-center text-white text-sm font-black border-none cursor-pointer
        [box-shadow:6px_6px_16px_#d8a0c0,_-4px_-4px_10px_#ffffff,_inset_3px_3px_8px_#ffb8d8,_inset_-3px_-3px_8px_#d05090]"
      >
        {initials}
      </button>

    </div>
  )
}