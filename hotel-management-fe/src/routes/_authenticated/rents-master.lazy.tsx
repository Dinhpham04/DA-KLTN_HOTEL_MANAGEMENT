import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_authenticated/rents-master')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/rents-master"!</div>
}
