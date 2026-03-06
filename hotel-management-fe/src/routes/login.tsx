import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/useAuth'
import { zodResolver } from '@hookform/resolvers/zod'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { Hotel, Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

const loginSchema = z.object({
  mail: z.string().min(1, 'Email không được để trống').email('Email không hợp lệ'),
  password: z.string().min(1, 'Mật khẩu không được để trống'),
})

type LoginFormData = z.infer<typeof loginSchema>

export const Route = createFileRoute('/login')({
  beforeLoad: () => {
    const token = localStorage.getItem('access_token')
    if (token) {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: LoginPage,
})

function LoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { login, isAuthenticated } = useAuth()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: '/dashboard' })
    }
  }, [isAuthenticated, navigate])

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login.mutateAsync({ mail: data.mail, password: data.password })
      navigate({ to: '/dashboard' })
    } catch {
      setError('root', { message: t('auth.loginError') })
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
            <Hotel size={24} className="text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">{t('common.appName')}</h1>
          <p className="text-sm text-muted-foreground">Hệ thống quản lý khách sạn</p>
        </div>

        {/* Login Card */}
        <Card>
          <CardHeader>
            <CardTitle>{t('auth.welcomeBack')}</CardTitle>
            <CardDescription>{t('auth.loginDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              {/* Root error */}
              {errors.root && (
                <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {errors.root.message}
                </div>
              )}

              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="mail">{t('auth.email')}</Label>
                <Input
                  id="mail"
                  type="email"
                  placeholder="admin@hotel.com"
                  autoComplete="email"
                  {...register('mail')}
                  className={errors.mail ? 'border-destructive' : ''}
                />
                {errors.mail && (
                  <p className="text-xs text-destructive">{errors.mail.message}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label htmlFor="password">{t('auth.password')}</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  {...register('password')}
                  className={errors.password ? 'border-destructive' : ''}
                />
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password.message}</p>
                )}
              </div>

              {/* Submit */}
              <Button type="submit" className="w-full" disabled={isSubmitting || login.isPending}>
                {(isSubmitting || login.isPending) && (
                  <Loader2 size={16} className="animate-spin" />
                )}
                {t('auth.loginButton')}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
