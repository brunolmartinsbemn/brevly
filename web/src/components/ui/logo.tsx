import logoSubtract from '../../assets/logo-subtract.svg'

export function Logo() {
  return (
    <span className="flex items-center gap-2">
      <img src={logoSubtract} alt="" width={26.6667} height={22.6667} />
      <span className="font-display text-[18.667px] leading-none font-bold text-blue-base">
        brev.ly
      </span>
    </span>
  )
}
