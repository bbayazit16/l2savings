# Average gas price data is provided by Etherscan.
# Timestamps are given in UTC.
# Script should be ideally run once a day, or
# every build.
# https://etherscan.io/chart/gasprice

from typing import Generator
from logging import error
from requests import get
from io import StringIO
from json import dump
import pandas as pd


def get_csv() -> pd.DataFrame:
    response: bytes = get("https://etherscan.io/chart/gasprice?output=csv",
    headers={"user-agent": "L2Savings"}).content
    # convert response to csv
    return pd.read_csv(StringIO(response.decode()))


def clear_csv(csv: pd.DataFrame) -> pd.DataFrame:
    # remove Date(UTC) from dataframe
    csv = csv.drop(["Date(UTC)"], axis=1)
    return csv


def to_dict(csv: pd.DataFrame) -> dict:
    # csv.to_json() does not return in the
    # required format.
    # Saves values starting from 2242th row (31 August).
    latest_timestamp: int = int(csv["UnixTimeStamp"].values[-1])

    timestamps: Generator = (int(y) for y in csv["UnixTimeStamp"].values[2224:])
    prices: Generator = (int(y) for y in csv["Value (Wei)"].values[2224:])

    info_dict: dict = dict(zip(timestamps, prices))

    info_dict["latest"] = latest_timestamp
    return info_dict


def dump_json(info: dict) -> None:
    with open("./src/historicalGasPrices.json", "w+") as f:
        dump(info, f)


if __name__ == "__main__":
    i = 0
    while i < 4:
        try:
            dump_json(to_dict(clear_csv(get_csv())))
            break
        except Exception as e:
            error(e)
            i += 1
