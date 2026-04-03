export type HostBackgroundId =
  | "reads-phrack"
  | "particles-green"
  | "faulty-terminal-green";

type HostMatcher = {
  exact?: string[];
  domain?: string[];
};

export type HostBackgroundSpec = {
  id: HostBackgroundId;
  match: HostMatcher;
};

type HostBackgroundBuckets = Record<HostBackgroundId, string[]>;

const HOST_BACKGROUND_ROTATION = [
  "reads-phrack",
  "particles-green",
  "faulty-terminal-green",
] as const satisfies readonly HostBackgroundId[];

const DISTRIBUTION_SEED = "public-host-backgrounds-v1";

const LOCAL_DEVELOPMENT_HOSTS = ["localhost"] as const;

const FIXED_HOST_BACKGROUNDS = {
  "reads.phrack.org": "reads-phrack",
} as const satisfies Record<string, HostBackgroundId>;

const PUBLIC_BACKGROUND_HOSTS = [
  "abin.lat",
  "halt.ciphine.com",
  "thc.extencil.me",
  "the.hackerschoice.org",
  "fwd.haltman.io",
  "1337.meu.bingo",
  "alias-for-lammers.howosec.com",
  "smokes.thc.org",
  "segfault.net",
  "stealth.rest",
  "503.lat",
  "haltman.org",
  "homoglyph.org",
  "reads.phrack.org",
  "pwnd.lat",
  "lockbit.io",
  "polkit.org",
  "revil.org",
  "kerberoast.org",
  "mishandle.org",
  "unhandle.org",
  "cobaltstrike.org",
  "johntheripper.org",
  "metasploit.io",
  "free.team-teso.net",
  "mail.mvttrb.com",
  "alias.email-shield.org",
  "lulz.antisec.net",
  "ghetto.eurocompton.net",
  "alt.haltman.io",
  "jail.revil.org",
  "email.abin.lat",
  "alias.abin.lat",
  "box.503.lat",
  "phreak.503.lat",
  "inbox.abin.lat",
  "phrack.abin.lat",
  "gang.lockbit.io",
  "7.metasploit.io",
  "msf.metasploit.io",
  "bbs.abin.lat",
  "rip.stealth.rest",
  "smb.kerberoast.org",
  "hash.johntheripper.org",
  "teso.pwnd.lat",
  "cracked.johntheripper.org",
  "beacon.cobaltstrike.org",
  "unix.polkit.org",
  "lou.abin.lat",
  "mail.haltman.io",
] as const;

function normalizeHost(hostname: string) {
  return hostname.trim().toLowerCase();
}

function hashString(input: string) {
  let hash = 2166136261;

  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function createEmptyBuckets(): HostBackgroundBuckets {
  return {
    "reads-phrack": [],
    "particles-green": [],
    "faulty-terminal-green": [],
  };
}

function createBalancedHostBackgrounds(hosts: readonly string[]): HostBackgroundSpec[] {
  const buckets = createEmptyBuckets();

  for (const [host, backgroundId] of Object.entries(FIXED_HOST_BACKGROUNDS)) {
    buckets[backgroundId].push(host);
  }

  const assignableHosts = [...new Set(hosts.map(normalizeHost))]
    .filter((host) => !Object.hasOwn(FIXED_HOST_BACKGROUNDS, host))
    .sort((left, right) => {
      const leftHash = hashString(`${DISTRIBUTION_SEED}:${left}`);
      const rightHash = hashString(`${DISTRIBUTION_SEED}:${right}`);
      return leftHash === rightHash ? left.localeCompare(right) : leftHash - rightHash;
    });

  for (const host of assignableHosts) {
    const backgroundId = [...HOST_BACKGROUND_ROTATION]
      .sort((left, right) => {
        const bucketSizeDiff = buckets[left].length - buckets[right].length;

        if (bucketSizeDiff !== 0) {
          return bucketSizeDiff;
        }

        const leftHash = hashString(`${DISTRIBUTION_SEED}:${host}:${left}`);
        const rightHash = hashString(`${DISTRIBUTION_SEED}:${host}:${right}`);
        return leftHash === rightHash ? left.localeCompare(right) : leftHash - rightHash;
      })[0];

    buckets[backgroundId].push(host);
  }

  return HOST_BACKGROUND_ROTATION.map((backgroundId) => ({
    id: backgroundId,
    match: {
      exact: buckets[backgroundId],
    },
  }));
}

export const HOST_BACKGROUNDS: readonly HostBackgroundSpec[] = [
  {
    id: "reads-phrack",
    match: {
      exact: [...LOCAL_DEVELOPMENT_HOSTS],
    },
  },
  ...createBalancedHostBackgrounds(PUBLIC_BACKGROUND_HOSTS),
];

function matchesHost(hostname: string, match: HostMatcher) {
  const normalizedHost = normalizeHost(hostname);

  if (!normalizedHost) {
    return false;
  }

  if (match.exact?.some((host) => normalizedHost === host.toLowerCase())) {
    return true;
  }

  if (
    match.domain?.some((domain) => {
      const normalizedDomain = domain.toLowerCase();
      return (
        normalizedHost === normalizedDomain ||
        normalizedHost.endsWith(`.${normalizedDomain}`)
      );
    })
  ) {
    return true;
  }

  return false;
}

export function getHostBackground(hostname: string) {
  return HOST_BACKGROUNDS.find((spec) => matchesHost(hostname, spec.match)) ?? null;
}
