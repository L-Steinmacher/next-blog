export function typedBoolean<T>(
    value: T
  ): value is Exclude<T, false | null | undefined | "" | 0> {
    return Boolean(value);
  }

export function formatRelativeTime(creationDate: string) {
  const postDate = new Date(creationDate);
  const currentTime = new Date();
  const timeDifference = currentTime.getTime() - postDate.getTime();
  const timeDifferenceInMinutes = Math.floor(timeDifference / (1000 * 60))
  const timeDifferenceInHours = Math.floor(timeDifference / (1000 * 60 * 60))

  if (timeDifferenceInMinutes < 5) {
    return "Just now."
  } else if ( timeDifferenceInMinutes < 60) {
    return "A few minutes ago."
  }

  switch (timeDifferenceInHours) {
    case 1:
      return "1 hour ago."
    case 2:
      return "2 hours ago."
    case 3:
      return "3 hours ago."
    case 4:
      return "4 hours ago."
    case 5:
      return "5 hours ago."
    case 6:
      return "6 hours ago."
    case 7:
      return "7 hours ago."
    case 8:
      return "8 hours ago."
    case 9:
      return "9 hours ago."
    case 10:
      return "10 hours ago."
    case 11:
      return "11 hours ago."
    case 12:
      return "12 hours ago."
    case 13:
      return "13 hours ago."
    case 14:
      return "14 hours ago."
    case 15:
      return "15 hours ago."
    case 16:
      return "16 hours ago."
    case 17:
      return "17 hours ago."
    case 18:
      return "18 hours ago."
    case 19:
      return "19 hours ago."
    case 20:
      return "20 hours ago."
    case 21:
      return "21 hours ago."
    case 22:
      return "22 hours ago."
    case 23:
      return "23 hours ago."
    default:
      return creationDate.split("T")[0]
  }
}
