open Belt;

let explode = (queryString: string) =>
  (
    queryString->Js.String.slice(~from=0, ~to_=1, _) == "?" ?
      queryString->Js.String.sliceToEnd(~from=1, _) : queryString
  )
  ->Js.String.split("&", _)
  ->Array.reduce(
      [],
      (acc, item) => {
        let array = Js.String.split("=", item);
        switch (array[0], array[1]) {
        | (Some(key), Some(value)) => [
            (
              Js.Global.decodeURIComponent(key),
              Js.Global.decodeURIComponent(value),
            ),
            ...acc,
          ]
        | _ => acc
        };
      },
    )
  ->List.toArray
  ->Map.String.fromArray;

let implode = map =>
  map
  ->Map.String.toList
  ->List.reduce([], (acc, (key, value)) =>
      [
        Js.Global.encodeURIComponent(key)
        ++ "="
        ++ Js.Global.encodeURIComponent(value),
        ...acc,
      ]
    )
  ->String.concat("&", _);
