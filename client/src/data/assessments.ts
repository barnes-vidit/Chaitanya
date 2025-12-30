export interface Question {
    id: string;
    text: string;
    type: 'scale' | 'yes_no' | 'input';
    options?: { label: string; value: number }[];
}

export interface AssessmentType {
    id: string;
    title: string;
    description: string;
    questions: Question[];
    maxScore: number;
}

export const assessments: AssessmentType[] = [
    {
        id: 'MMSE',
        title: 'Mini-Mental State Examination (MMSE)',
        description: 'A standard screening specifically for cognitive impairment.',
        maxScore: 30,
        questions: [
            {
                id: 'orientation_year',
                text: 'What is the current year?',
                type: 'input',
            },
            {
                id: 'orientation_season',
                text: 'What is the current season?',
                type: 'input',
            },
            {
                id: 'registration_objects',
                text: 'Repeat these three words: Apple, Penny, Table. (Score 1 for each correct answer)',
                type: 'scale',
                options: [
                    { label: '0 Correct', value: 0 },
                    { label: '1 Correct', value: 1 },
                    { label: '2 Correct', value: 2 },
                    { label: '3 Correct', value: 3 },
                ],
            },
            {
                id: 'attention_serial_7s',
                text: 'Subtract 7 from 100, then subtract 7 from that number, and so on. Stop after 5 answers. (93, 86, 79, 72, 65)',
                type: 'scale',
                options: [
                    { label: '0 Correct', value: 0 },
                    { label: '1 Correct', value: 1 },
                    { label: '2 Correct', value: 2 },
                    { label: '3 Correct', value: 3 },
                    { label: '4 Correct', value: 4 },
                    { label: '5 Correct', value: 5 },
                ],
            },
        ],
    },
    {
        id: 'GDS',
        title: 'Geriatric Depression Scale (GDS)',
        description: 'A screening tool to identify depression in older adults.',
        maxScore: 15,
        questions: [
            {
                id: 'gds_1',
                text: 'Are you basically satisfied with your life?',
                type: 'yes_no',
                options: [
                    { label: 'Yes', value: 0 },
                    { label: 'No', value: 1 },
                ],
            },
            {
                id: 'gds_2',
                text: 'Have you dropped many of your activities and interests?',
                type: 'yes_no',
                options: [
                    { label: 'Yes', value: 1 },
                    { label: 'No', value: 0 },
                ],
            },
            {
                id: 'gds_3',
                text: 'Do you feel that your life is empty?',
                type: 'yes_no',
                options: [
                    { label: 'Yes', value: 1 },
                    { label: 'No', value: 0 },
                ],
            },
            {
                id: 'gds_4',
                text: 'Do you often get bored?',
                type: 'yes_no',
                options: [
                    { label: 'Yes', value: 1 },
                    { label: 'No', value: 0 },
                ],
            },
        ],
    },
];
