import {IRouterParamContext} from 'koa-router'
import {Next, ParameterizedContext} from 'koa'
import {CertificateService} from '../services/certificate.service'
import {ResponseModel} from '../models/response.model'

export module CertificateController{
    export async function create(
        ctx: ParameterizedContext<any, IRouterParamContext<any, {}>, any>,
        next:Next
    ) {
        try {
            let cert = ctx.request.body
            await CertificateService.createCertificate(cert)
            ctx.body = new ResponseModel()
        } catch (e: any) {
            throw e
        }
    }

    export async function trust(
        ctx: ParameterizedContext<any, IRouterParamContext<any, {}>, any>,
        next:Next
    ) {
        try {
            let cert = ctx.request.body
            await CertificateService.trustServerCertificate(cert)
            ctx.body = new ResponseModel()
        } catch (e: any) {
            throw e
        }
    }

    export async function reject(
        ctx: ParameterizedContext<any, IRouterParamContext<any, {}>, any>,
        next:Next
    ) {
        try {
            let cert = ctx.request.body
            await CertificateService.rejectServerCertificate(cert)
            ctx.body = new ResponseModel()
        } catch (e: any) {
            throw e
        }
    }

    export async function getTrustStatus(
        ctx: ParameterizedContext<any, IRouterParamContext<any, {}>, any>,
        next:Next
    ) {
        try {
            let cert = ctx.request.body
            ctx.body = CertificateService.getTrustStatus(cert)
        } catch (e: any) {
            throw e
        }
    }
}