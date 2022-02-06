import os

from src import Avalanche, AvalancheForecastLayer


def test_example_avi_report():
    dir_path = os.path.dirname(os.path.realpath(__file__))
    filepath = os.path.join(dir_path, "example_avi.html")
    with open(filepath) as f:
        expected = Avalanche(
            title="Avalanche Bulletin - Sea to Sky",
            date_issued="2022-02-06T00:00:00Z",
            valid_until="2022-02-07T00:00:00Z",
            forecaster="TRettie",
            summary="Avoid avalanche terrain  at treeline where triggering a persistent slab avalanche is most likely. High freezing levels and solar radiation could increase the likelihood oftriggering this layer.",
            layers=[
                AvalancheForecastLayer(
                    date='Sun, 06 Feb',
                    alpine_rating='3 Considerable',
                    treeline_rating='3 Considerable',
                    below_treeline_rating='2 Moderate'
                ),
                AvalancheForecastLayer(
                    date='Mon, 07 Feb',
                    alpine_rating='3 Considerable',
                    treeline_rating='3 Considerable',
                    below_treeline_rating='2 Moderate',
                ),
                AvalancheForecastLayer(
                    date='Tue, 08 Feb',
                    alpine_rating='2 Moderate',
                    treeline_rating='3 Considerable',
                    below_treeline_rating='2 Moderate',
                ),
            ],
            confidence="Moderate",
            advice=[
                "Be aware of the potential for large avalanches due to the presence of buried weak layers.",
                "Remote triggering is a concern, watch out for adjacent and overhead slopes.",
                "Extra caution is needed around cornices under the current conditions.",
                "Watch for unstable snow on specific terrain features, especially when the snow is moist or wet.",
                "Avoid freshly wind loaded features, especially near ridge crests, roll-overs and in steep terrain.",
            ],
        )
        actual = Avalanche.from_html(f.read())

        assert actual == expected
