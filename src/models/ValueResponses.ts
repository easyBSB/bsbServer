
import { AdditionalProperties, Description, Enum, Example, from, Required } from "@tsed/schema";

export enum readonly {
    true = 1,
    false = 0
}

@Example({})
export class ValueResponseEntry {

    @Required()
    @Description('Translated name of the parameter')
    name: string

    @Required()
    error: number

    @Required()
    value: string

    @Required()
    desc: string

    @Required()
    dataType: number

    @Required()
    @Enum(readonly)
    readonly: number

    @Required()
    unit: string
}


@Example({
    '700': {
        name: 'Betriebsart',
        error: 0,
        value: '1',
        desc: 'Automatic',
        dataType: 1,
        readonly: 0,
        unit: ''
    },
    '710': {
        name: 'Komfortsollwert',
        error: 0,
        value: '22.0',
        desc: '',
        dataType: 0,
        readonly: 0,
        unit: '°C'
    },
}
)
@AdditionalProperties(from(ValueResponseEntry))
export class ValueResponse {
    [key: string]: ValueResponseEntry
}


// {
//     "710": {
//         "status": 1
//     }
// }