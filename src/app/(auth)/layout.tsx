interface Props {
  children: React.ReactNode
}

const AuthLayout = ({ children }: Props) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      {children}
    </div>
  )
}

export default AuthLayout
