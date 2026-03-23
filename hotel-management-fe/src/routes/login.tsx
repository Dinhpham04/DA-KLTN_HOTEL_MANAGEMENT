import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/useAuth'
import { cn, getApiErrorMessage } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
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
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)

  const loginFormHook = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { mail: '', password: '' },
  })

  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: '/dashboard' })
    }
  }, [isAuthenticated, navigate])

  const handleLoginSubmit = (data: LoginFormData) => {
    login.mutate(
      { mail: data.mail, password: data.password },
      {
        onSuccess: () => {
          navigate({ to: '/dashboard' })
        },
        onError: (error) => {
          toast.error(
            getApiErrorMessage(error, t('auth.loginError'), {
              401: t('auth.invalidCredentials'),
              403: t('auth.accountLocked'),
              429: t('auth.tooManyAttempts'),
            })
          )
        },
      }
    )
  }

  const togglePasswordVisibility = () => setIsPasswordVisible((prev) => !prev)

  return (
    <main
      className={cn(
        "flex justify-center items-center bg-[url('/hotel-bg.jpg')] bg-cover bg-center bg-no-repeat h-screen"
      )}
    >
      <article className="bg-neutral bg-white shadow-xl p-[4rem] rounded-[.8rem] font-bold text-[1.6rem] card card-side">
        <section className="card-body">
          <div className={cn('mx-auto px-4 max-w-[36.5rem] font-semibold text-[1.5rem]')}>
            <Form {...loginFormHook}>
              <form onSubmit={loginFormHook.handleSubmit(handleLoginSubmit)}>
                <legend className="mb-10 font-bold text-[2.3rem] text-center">
                  {t('common.appName')}
                </legend>
                <p className="mb-10 text-center text-[1.4rem] font-normal text-muted-foreground">
                  {t('auth.loginDescription')}
                </p>

                {/* Email */}
                <FormField
                  control={loginFormHook.control}
                  name="mail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold text-[#111827] text-[1.5rem]">
                        {t('auth.email')}
                      </FormLabel>
                      <FormControl>
                        <div
                          className={cn(
                            'flex items-center border border-[#D1D5DB] rounded-[.6rem] w-[35rem] overflow-hidden'
                          )}
                        >
                          <Input
                            type="email"
                            placeholder="admin@hotel.com"
                            autoComplete="email"
                            className="bg-[#fff] py-0 border-none rounded-[.6rem] h-14 text-[1.25rem] focus-visible:ring-0 focus-visible:ring-offset-0"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e)
                              loginFormHook.clearErrors('mail')
                            }}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-500 text-[1.25rem]" />
                    </FormItem>
                  )}
                />

                {/* Password */}
                <FormField
                  control={loginFormHook.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="relative mt-[1.6rem]">
                      <FormLabel className="font-bold text-[#111827] text-[1.5rem]">
                        {t('auth.password')}
                      </FormLabel>
                      <FormControl>
                        <div
                          className={cn(
                            'flex items-center border border-[#D1D5DB] rounded-[.6rem] w-[35rem] overflow-hidden'
                          )}
                        >
                          <Input
                            type={isPasswordVisible ? 'text' : 'password'}
                            autoComplete="current-password"
                            className="[&::-ms-reveal]:hidden py-0 border-none h-14 text-[1.25rem] focus-visible:ring-0 focus-visible:ring-offset-0"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e)
                              loginFormHook.clearErrors('password')
                            }}
                          />
                          <div
                            onClick={togglePasswordVisibility}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') togglePasswordVisibility()
                            }}
                            role="button"
                            tabIndex={0}
                            className={cn(
                              'flex justify-center items-center mx-5 w-6 h-6 cursor-pointer'
                            )}
                          >
                            {isPasswordVisible ? (
                              <Eye className="w-12 h-12" />
                            ) : (
                              <EyeOff className="w-12 h-12" />
                            )}
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-500 text-[1.25rem]" />
                    </FormItem>
                  )}
                />

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={login.isPending}
                  className="flex justify-center items-center bg-[#4F46E5] hover:bg-[#3d35a8] mt-10 rounded-[.6rem] w-[35rem] h-14"
                >
                  {login.isPending && <Loader2 className="w-6 h-6 animate-spin mr-2" />}
                  <span className="font-bold text-white text-[1.5rem]">
                    {t('auth.loginButton')}
                  </span>
                </Button>
              </form>
            </Form>
          </div>
        </section>
      </article>
    </main>
  )
}
