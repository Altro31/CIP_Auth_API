import {ArgumentMetadata, BadRequestException, Injectable, PipeTransform} from "@nestjs/common";

@Injectable()
export class RequiredPipe implements PipeTransform {
    transform(value: any, metadata: ArgumentMetadata): any {
        if (!value) throw new BadRequestException(`Required argument ${metadata.data} in body`)
        return value;
    }
}