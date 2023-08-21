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
  } else if (timeDifferenceInHours < 24) {
    return `${timeDifferenceInHours} hours ago.`
  } else {
    return postDate.toLocaleDateString();
  }
}
