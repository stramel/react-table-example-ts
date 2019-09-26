import namor from 'namor'

function range(length: number) {
  return Array.from({ length })
}

export interface Person {
  firstName: string,
  lastName: string,
  age: number,
  visits: number,
  progress: number,
  status: 'relationship' | 'complicated' | 'single'
}

function newPerson(): Person {
  const statusChance = Math.random()
  return {
    firstName: namor.generate({ words: 1, numbers: 0 }),
    lastName: namor.generate({ words: 1, numbers: 0 }),
    age: Math.floor(Math.random() * 30),
    visits: Math.floor(Math.random() * 100),
    progress: Math.floor(Math.random() * 100),
    status:
      statusChance > 0.66
        ? 'relationship'
        : statusChance > 0.33
        ? 'complicated'
        : 'single',
  }
}

export interface Data extends Person {
  subRows?: Data[]
}

export function makeData(...lens: number[]): Data[] {
  function makeDataLevel(depth: number = 0): Data[] {
    const len = lens[depth]
    return range(len).map(d => {
      return {
        ...newPerson(),
        subRows: lens[depth + 1] ? makeDataLevel(depth + 1) : undefined,
      }
    })
  }

  return makeDataLevel()
}