import { BaseSchema } from "./base-schema"

export interface ResourceDescriptor {
    search: ResourceOperationDescriptor
    view: ResourceOperationDescriptor
    edit: ResourceOperationDescriptor
    create: ResourceOperationDescriptor
    delete: ResourceOperationDescriptor
}

export type ResourceOperationDescriptor = {
    // /r/contacts
    resourceName: string,
    endpoint: string
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    querySchema?: BaseSchema,
    bodySchema?: BaseSchema,
    responseSchema?: BaseSchema
}