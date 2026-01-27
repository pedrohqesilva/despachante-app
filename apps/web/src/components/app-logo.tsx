import { baseUrl } from "@/config/app"
import { useEffect, useState } from "react"

export function AppLogo() {
    const [isDark, setIsDark] = useState(false)

    useEffect(() => {
        const checkTheme = () => {
            setIsDark(document.documentElement.classList.contains("dark"))
        }

        checkTheme()

        const observer = new MutationObserver(checkTheme)
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class"],
        })

        return () => observer.disconnect()
    }, [])

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
                alt="Vitrizium Logo"
                className="h-8 w-auto"
            />
            <img
                src={textoPath}
                alt="Vitrizium"
                className="h-4 w-auto"
            />
        </div>
    )
}