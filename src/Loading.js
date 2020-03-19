import { Spinner } from '@instructure/ui-spinner'
import React from 'react'

export function Loading() {
  return <Spinner size="large" margin="large" renderTitle="Loading data..."/>
}