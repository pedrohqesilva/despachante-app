import { baseUrl } from "@/config/app"
import { useSyncExternalStore } from "react"

function subscribe(callback: () => void) {
    const observer = new MutationObserver(callback)
    observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class"],
    })
    return () => observer.disconnect()
}

function getSnapshot() {
    return document.documentElement.classList.contains("dark")
}

function getServerSnapshot() {
    return false
}

export function AppLogo() {
    const isDark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

    const logoPath = isDark
        ? `${baseUrl}/assets/logos/logos/diamante_branco.svg`
        : `${baseUrl}/assets/logos/logos/diamante_preto.svg`

    const textoPath = isDark
        ? `${baseUrl}/assets/logos/logos/texto_branco.svg`
        : `${baseUrl}/assets/logos/logos/texto_preto.svg`

    return (
        <div className='flex items-center' style={{ gap: '24px' }}>
            <img
                src={logoPath}
                alt="Despachapp Logo"
                className="h-8 w-auto"
            />
            <img
                src={textoPath}
                alt="Despachapp"
                className="h-4 w-auto"
            />
        </div>
    )
}