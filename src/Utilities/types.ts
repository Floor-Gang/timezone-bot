type select_tz_zones = {
  id: number;
  name: string;
  gmt: string;
  offset: number;
};

type select_length_tz_zones = {
  Length: number;
};

type select_server_zones = {
  id: number;
  server_ID: number;
  zone_ID: number;
};

type select_server_tz_zones = {
  id: number;
  server_ID: number;
  zone_ID: number;
  name: string;
  gmt: string;
  offset: number;
};

type makeEmbeded = {
  name: string;
  value: string;
  inline?: boolean;
};
