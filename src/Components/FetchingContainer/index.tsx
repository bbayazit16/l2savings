import Info from "../Info"

interface IFetchingInfo {
    progress: {
        progress: CalcProgress
        displayName: string
    }[]
}

const FetchingInfo = ({ progress }: IFetchingInfo) => {
    return (
        <div className="absolute right-8 top-28 space-y-2 w-48 md:w-64">
            {progress.map(({ progress, displayName }, index) => {
                return (
                    <Info
                        key={index}
                        title={`Fetching ${displayName} transactions`}
                        text={`${progress.current || "0"}/${progress.total || "?"}`}
                        disappear={progress.total === progress.current}
                        completionTitle={`Fetched ${displayName} transactions`}
                    />
                )
            })}
        </div>
    )
}

export default FetchingInfo
