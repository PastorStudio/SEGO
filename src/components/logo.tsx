
import { cn } from "@/lib/utils"

export function Logo({ className, color, ...props }: React.SVGProps<SVGSVGElement> & { color?: string }) {
  const textColor = color === 'white' ? '#FFFFFF' : 'hsl(var(--primary))';
  
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 50"
      className={cn("h-auto", className)}
      {...props}
    >
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@700&display=swap');
          
          .sego-main-text {
            font-family: 'Montserrat', sans-serif;
            font-weight: 700;
            font-size: 18px;
            fill: ${textColor};
            letter-spacing: 0.05em;
          }
        `}
      </style>
      <text x="100" y="35" textAnchor="middle" className="sego-main-text">SEGO Eventos</text>
    </svg>
  )
}
