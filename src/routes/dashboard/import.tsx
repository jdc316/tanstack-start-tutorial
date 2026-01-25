import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { bulkScrapeUrlFn, mapUrlFn, scrapeUrlFn } from '@/data/items'
import { bulkImportSchema, importSchema } from '@/schemas/import'
import { type SearchResultWeb } from '@mendable/firecrawl-js'
import { useForm } from '@tanstack/react-form'
import { createFileRoute } from '@tanstack/react-router'
import { Globe, LinkIcon, Loader2 } from 'lucide-react'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'

export const Route = createFileRoute('/dashboard/import')({
  component: RouteComponent,
})

function RouteComponent() {
  const [isPending, startTransition] = useTransition()

  // bulk import state
  const [discoveredLinks, setDiscoveredLinks] = useState<Array<SearchResultWeb>>([])
  const [selectedUrls, setSelectedUrls] = useState<Set<string>>(new Set())
  const [bulkIsPending, startBulkTransition] = useTransition()

  function handleSelectAll() {
    if (selectedUrls.size === discoveredLinks.length) {
      setSelectedUrls(new Set())
    } else {
      setSelectedUrls(new Set(discoveredLinks.map((link) => link.url)))
    }
  }

  function handleToggleUrl(url: string) {
    const newSelectedUrls = new Set(selectedUrls)

    if (newSelectedUrls.has(url)) {
      newSelectedUrls.delete(url)
    } else {
      newSelectedUrls.add(url)
    }

    setSelectedUrls(newSelectedUrls)
  }

  function handleBulkImport() {
    startBulkTransition(async () => {
      if (selectedUrls.size === 0) {
        toast.error('Please select at least one URL to import')
        return
      }

      await bulkScrapeUrlFn({
        data: {
          urls: Array.from(selectedUrls)
        }
      })

      toast.success(`Successfully imported ${selectedUrls.size} URLs`)
    })

  }

  const form = useForm({
    defaultValues: {
      url: '',
    },
    validators: {
      onSubmit: importSchema,
    },
    onSubmit: ({ value }) => {
      startTransition(async () => {
        console.log(value)
        await scrapeUrlFn({ data: value })
        toast.success('URL Scraped Successfully')
      })
    },
  })

  const bulkForm = useForm({
    defaultValues: {
      url: '',
      search: '',
    },
    validators: {
      onSubmit: bulkImportSchema,
    },
    onSubmit: ({ value }) => {
      startTransition(async () => {
        console.log(value)
        const data = await mapUrlFn({ data: value })
        setDiscoveredLinks(data)
      })
    },
  })

  return (
    <div className="flex flex-1 items-center justify-center py-8">
      <div className="w-full max-w-2xl space-y-6 px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Import Content</h1>
          <p className="text-muted-foreground pt-1">
            Save web pages to your library for later reading
          </p>
        </div>

        <Tabs defaultValue="single">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="single" className="gap-2">
              <LinkIcon className="size-4" />
              Single URL
            </TabsTrigger>
            <TabsTrigger value="bulk" className="gap-2">
              <Globe className="size-4" />
              Bulk Import
            </TabsTrigger>
          </TabsList>

          <TabsContent value="single">
            <Card>
              <CardHeader>
                <CardTitle>
                  Import Single URL
                  <CardDescription>
                    Scrape and save content from any web app!
                  </CardDescription>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    form.handleSubmit()
                  }}
                >
                  <FieldGroup>
                    {' '}
                    <form.Field
                      name="url"
                      children={(field) => {
                        const isInvalid =
                          field.state.meta.isTouched &&
                          !field.state.meta.isValid
                        return (
                          <Field data-invalid={isInvalid}>
                            <FieldLabel htmlFor={field.name}>URL</FieldLabel>
                            <Input
                              id={field.name}
                              name={field.name}
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                              aria-invalid={isInvalid}
                              placeholder="https://yoururlhere.com"
                              autoComplete="off"
                            />
                            {isInvalid && (
                              <FieldError errors={field.state.meta.errors} />
                            )}
                          </Field>
                        )
                      }}
                    />
                    <Button type="submit" disabled={isPending}>
                      {isPending ? (
                        <>
                          <Loader2 className="size-4 animate-spin">
                            Processing...
                          </Loader2>
                        </>
                      ) : (
                        'Import URL'
                      )}
                    </Button>
                  </FieldGroup>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bulk">
            <Card>
              <CardHeader>
                <CardTitle>
                  Import Bulk
                  <CardDescription>
                    Discover and import multiple URLs from a website at once
                  </CardDescription>
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-6'>
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    bulkForm.handleSubmit()
                  }}
                >
                  <FieldGroup>
                    <bulkForm.Field
                      name="url"
                      children={(field) => {
                        const isInvalid =
                          field.state.meta.isTouched &&
                          !field.state.meta.isValid
                        return (
                          <Field data-invalid={isInvalid}>
                            <FieldLabel htmlFor={field.name}>URL</FieldLabel>
                            <Input
                              id={field.name}
                              name={field.name}
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                              aria-invalid={isInvalid}
                              placeholder="https://yoururlhere.com"
                              autoComplete="off"
                            />
                            {isInvalid && (
                              <FieldError errors={field.state.meta.errors} />
                            )}
                          </Field>
                        )
                      }}
                    />
                    <bulkForm.Field
                      name="search"
                      children={(field) => {
                        const isInvalid =
                          field.state.meta.isTouched &&
                          !field.state.meta.isValid
                        return (
                          <Field data-invalid={isInvalid}>
                            <FieldLabel htmlFor={field.name}>
                              Filter (optional)
                            </FieldLabel>
                            <Input
                              id={field.name}
                              name={field.name}
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                              aria-invalid={isInvalid}
                              placeholder="example: Blog, docs, tutorial"
                              autoComplete="off"
                            />
                            {isInvalid && (
                              <FieldError errors={field.state.meta.errors} />
                            )}
                          </Field>
                        )
                      }}
                    />
                    <Button type="submit" disabled={isPending}>
                      {isPending ? (
                        <>
                          <Loader2 className="size-4 animate-spin">
                            Processing...
                          </Loader2>
                        </>
                      ) : (
                        'Import URLs'
                      )}
                    </Button>
                  </FieldGroup>
                </form>

                {/* discoverd urls list */}
                {
                  discoveredLinks.length > 0 && (
                    <div className='space-y-4'>
                      <div className='flex items-center justify-between'>
                        <p className='text-sm font-medium'>Found {discoveredLinks.length} URLs</p>
                        <Button variant='outline' size='sm' onClick={handleSelectAll}>
                          {selectedUrls.size === discoveredLinks.length ? 'Deselect All' : 'Select All'}
                        </Button>
                      </div>
                      <div className='max-h-80 space-y-2 overflow-y-auto rounded-md border p-4'>
                        {discoveredLinks.map((link) => (
                          <label key={link.url} className='hover:bg-muted/50 flex cursor-pointer items-start gap-3 rounded-md p-2'>
                            <Checkbox checked={selectedUrls.has(link.url)} onCheckedChange={() => handleToggleUrl(link.url)} className='mt-0.5' />
                            <div className='min-w-0 flex-1'>
                              <p className='truncate text-sm font-medium'>{link.title ?? 'Title has not been found'}</p>
                              <p className='text-muted-foreground truncate text-xs'>{link.description ?? 'Description has not been found'}</p>
                              <p className='text-muted-foreground truncate text-xs'>{link.url}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                      <Button
                        disabled={bulkIsPending}
                        className='w-full'
                        onClick={handleBulkImport}
                        type='button'
                      >
                        {
                          bulkIsPending ? (
                            <>
                              <Loader2 className='size-4 animate-spin' />
                              Importing...
                            </>

                          ) : selectedUrls.size === 0 ? `Import URLs` : (`Import ${selectedUrls.size} URLs`)
                        }
                      </Button>
                    </div>
                  )
                }
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
