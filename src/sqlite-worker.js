(() => {
  var __create = Object.create;
  var __getProtoOf = Object.getPrototypeOf;
  var __defProp = Object.defineProperty;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  function __accessProp(key) {
    return this[key];
  }
  var __toESMCache_node;
  var __toESMCache_esm;
  var __toESM = (mod, isNodeMode, target) => {
    var canCache = mod != null && typeof mod === "object";
    if (canCache) {
      var cache = isNodeMode ? __toESMCache_node ??= new WeakMap : __toESMCache_esm ??= new WeakMap;
      var cached = cache.get(mod);
      if (cached)
        return cached;
    }
    target = mod != null ? __create(__getProtoOf(mod)) : {};
    const to = isNodeMode || !mod || !mod.__esModule || !__hasOwnProp.call(mod, "default") ? __defProp(target, "default", { value: mod, enumerable: true }) : target;
    if (mod && typeof mod === "object" || typeof mod === "function") {
      for (let key of __getOwnPropNames(mod))
        if (!__hasOwnProp.call(to, key))
          __defProp(to, key, {
            get: __accessProp.bind(mod, key),
            enumerable: true
          });
    }
    if (canCache)
      cache.set(mod, to);
    return to;
  };
  var __commonJS = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);

  // node_modules/semver/internal/constants.js
  var require_constants = __commonJS(function(exports, module) {
    var SEMVER_SPEC_VERSION = "2.0.0";
    var MAX_LENGTH = 256;
    var MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER || 9007199254740991;
    var MAX_SAFE_COMPONENT_LENGTH = 16;
    var MAX_SAFE_BUILD_LENGTH = MAX_LENGTH - 6;
    var RELEASE_TYPES = [
      "major",
      "premajor",
      "minor",
      "preminor",
      "patch",
      "prepatch",
      "prerelease"
    ];
    module.exports = {
      MAX_LENGTH,
      MAX_SAFE_COMPONENT_LENGTH,
      MAX_SAFE_BUILD_LENGTH,
      MAX_SAFE_INTEGER,
      RELEASE_TYPES,
      SEMVER_SPEC_VERSION,
      FLAG_INCLUDE_PRERELEASE: 1,
      FLAG_LOOSE: 2
    };
  });

  // node_modules/semver/internal/debug.js
  var require_debug = __commonJS(function(exports, module) {
    var debug = typeof process === "object" && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG) ? (...args) => console.error("SEMVER", ...args) : () => {};
    module.exports = debug;
  });

  // node_modules/semver/internal/re.js
  var require_re = __commonJS(function(exports, module) {
    var {
      MAX_SAFE_COMPONENT_LENGTH,
      MAX_SAFE_BUILD_LENGTH,
      MAX_LENGTH
    } = require_constants();
    var debug = require_debug();
    exports = module.exports = {};
    var re = exports.re = [];
    var safeRe = exports.safeRe = [];
    var src = exports.src = [];
    var safeSrc = exports.safeSrc = [];
    var t = exports.t = {};
    var R = 0;
    var LETTERDASHNUMBER = "[a-zA-Z0-9-]";
    var safeRegexReplacements = [
      ["\\s", 1],
      ["\\d", MAX_LENGTH],
      [LETTERDASHNUMBER, MAX_SAFE_BUILD_LENGTH]
    ];
    var makeSafeRegex = (value) => {
      for (const [token, max] of safeRegexReplacements) {
        value = value.split(`${token}*`).join(`${token}{0,${max}}`).split(`${token}+`).join(`${token}{1,${max}}`);
      }
      return value;
    };
    var createToken = (name, value, isGlobal) => {
      const safe = makeSafeRegex(value);
      const index = R++;
      debug(name, index, value);
      t[name] = index;
      src[index] = value;
      safeSrc[index] = safe;
      re[index] = new RegExp(value, isGlobal ? "g" : undefined);
      safeRe[index] = new RegExp(safe, isGlobal ? "g" : undefined);
    };
    createToken("NUMERICIDENTIFIER", "0|[1-9]\\d*");
    createToken("NUMERICIDENTIFIERLOOSE", "\\d+");
    createToken("NONNUMERICIDENTIFIER", `\\d*[a-zA-Z-]${LETTERDASHNUMBER}*`);
    createToken("MAINVERSION", `(${src[t.NUMERICIDENTIFIER]})\\.` + `(${src[t.NUMERICIDENTIFIER]})\\.` + `(${src[t.NUMERICIDENTIFIER]})`);
    createToken("MAINVERSIONLOOSE", `(${src[t.NUMERICIDENTIFIERLOOSE]})\\.` + `(${src[t.NUMERICIDENTIFIERLOOSE]})\\.` + `(${src[t.NUMERICIDENTIFIERLOOSE]})`);
    createToken("PRERELEASEIDENTIFIER", `(?:${src[t.NONNUMERICIDENTIFIER]}|${src[t.NUMERICIDENTIFIER]})`);
    createToken("PRERELEASEIDENTIFIERLOOSE", `(?:${src[t.NONNUMERICIDENTIFIER]}|${src[t.NUMERICIDENTIFIERLOOSE]})`);
    createToken("PRERELEASE", `(?:-(${src[t.PRERELEASEIDENTIFIER]}(?:\\.${src[t.PRERELEASEIDENTIFIER]})*))`);
    createToken("PRERELEASELOOSE", `(?:-?(${src[t.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${src[t.PRERELEASEIDENTIFIERLOOSE]})*))`);
    createToken("BUILDIDENTIFIER", `${LETTERDASHNUMBER}+`);
    createToken("BUILD", `(?:\\+(${src[t.BUILDIDENTIFIER]}(?:\\.${src[t.BUILDIDENTIFIER]})*))`);
    createToken("FULLPLAIN", `v?${src[t.MAINVERSION]}${src[t.PRERELEASE]}?${src[t.BUILD]}?`);
    createToken("FULL", `^${src[t.FULLPLAIN]}$`);
    createToken("LOOSEPLAIN", `[v=\\s]*${src[t.MAINVERSIONLOOSE]}${src[t.PRERELEASELOOSE]}?${src[t.BUILD]}?`);
    createToken("LOOSE", `^${src[t.LOOSEPLAIN]}$`);
    createToken("GTLT", "((?:<|>)?=?)");
    createToken("XRANGEIDENTIFIERLOOSE", `${src[t.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`);
    createToken("XRANGEIDENTIFIER", `${src[t.NUMERICIDENTIFIER]}|x|X|\\*`);
    createToken("XRANGEPLAIN", `[v=\\s]*(${src[t.XRANGEIDENTIFIER]})` + `(?:\\.(${src[t.XRANGEIDENTIFIER]})` + `(?:\\.(${src[t.XRANGEIDENTIFIER]})` + `(?:${src[t.PRERELEASE]})?${src[t.BUILD]}?` + `)?)?`);
    createToken("XRANGEPLAINLOOSE", `[v=\\s]*(${src[t.XRANGEIDENTIFIERLOOSE]})` + `(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})` + `(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})` + `(?:${src[t.PRERELEASELOOSE]})?${src[t.BUILD]}?` + `)?)?`);
    createToken("XRANGE", `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAIN]}$`);
    createToken("XRANGELOOSE", `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAINLOOSE]}$`);
    createToken("COERCEPLAIN", `${"(^|[^\\d])" + "(\\d{1,"}${MAX_SAFE_COMPONENT_LENGTH}})` + `(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?` + `(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?`);
    createToken("COERCE", `${src[t.COERCEPLAIN]}(?:$|[^\\d])`);
    createToken("COERCEFULL", src[t.COERCEPLAIN] + `(?:${src[t.PRERELEASE]})?` + `(?:${src[t.BUILD]})?` + `(?:$|[^\\d])`);
    createToken("COERCERTL", src[t.COERCE], true);
    createToken("COERCERTLFULL", src[t.COERCEFULL], true);
    createToken("LONETILDE", "(?:~>?)");
    createToken("TILDETRIM", `(\\s*)${src[t.LONETILDE]}\\s+`, true);
    exports.tildeTrimReplace = "$1~";
    createToken("TILDE", `^${src[t.LONETILDE]}${src[t.XRANGEPLAIN]}$`);
    createToken("TILDELOOSE", `^${src[t.LONETILDE]}${src[t.XRANGEPLAINLOOSE]}$`);
    createToken("LONECARET", "(?:\\^)");
    createToken("CARETTRIM", `(\\s*)${src[t.LONECARET]}\\s+`, true);
    exports.caretTrimReplace = "$1^";
    createToken("CARET", `^${src[t.LONECARET]}${src[t.XRANGEPLAIN]}$`);
    createToken("CARETLOOSE", `^${src[t.LONECARET]}${src[t.XRANGEPLAINLOOSE]}$`);
    createToken("COMPARATORLOOSE", `^${src[t.GTLT]}\\s*(${src[t.LOOSEPLAIN]})$|^$`);
    createToken("COMPARATOR", `^${src[t.GTLT]}\\s*(${src[t.FULLPLAIN]})$|^$`);
    createToken("COMPARATORTRIM", `(\\s*)${src[t.GTLT]}\\s*(${src[t.LOOSEPLAIN]}|${src[t.XRANGEPLAIN]})`, true);
    exports.comparatorTrimReplace = "$1$2$3";
    createToken("HYPHENRANGE", `^\\s*(${src[t.XRANGEPLAIN]})` + `\\s+-\\s+` + `(${src[t.XRANGEPLAIN]})` + `\\s*$`);
    createToken("HYPHENRANGELOOSE", `^\\s*(${src[t.XRANGEPLAINLOOSE]})` + `\\s+-\\s+` + `(${src[t.XRANGEPLAINLOOSE]})` + `\\s*$`);
    createToken("STAR", "(<|>)?=?\\s*\\*");
    createToken("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$");
    createToken("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$");
  });

  // node_modules/semver/internal/parse-options.js
  var require_parse_options = __commonJS(function(exports, module) {
    var looseOption = Object.freeze({ loose: true });
    var emptyOpts = Object.freeze({});
    var parseOptions = (options) => {
      if (!options) {
        return emptyOpts;
      }
      if (typeof options !== "object") {
        return looseOption;
      }
      return options;
    };
    module.exports = parseOptions;
  });

  // node_modules/semver/internal/identifiers.js
  var require_identifiers = __commonJS(function(exports, module) {
    var numeric = /^[0-9]+$/;
    var compareIdentifiers = (a, b) => {
      if (typeof a === "number" && typeof b === "number") {
        return a === b ? 0 : a < b ? -1 : 1;
      }
      const anum = numeric.test(a);
      const bnum = numeric.test(b);
      if (anum && bnum) {
        a = +a;
        b = +b;
      }
      return a === b ? 0 : anum && !bnum ? -1 : bnum && !anum ? 1 : a < b ? -1 : 1;
    };
    var rcompareIdentifiers = (a, b) => compareIdentifiers(b, a);
    module.exports = {
      compareIdentifiers,
      rcompareIdentifiers
    };
  });

  // node_modules/semver/classes/semver.js
  var require_semver = __commonJS(function(exports, module) {
    var debug = require_debug();
    var { MAX_LENGTH, MAX_SAFE_INTEGER } = require_constants();
    var { safeRe: re, t } = require_re();
    var parseOptions = require_parse_options();
    var { compareIdentifiers } = require_identifiers();
    var isPrereleaseIdentifier = (prerelease, identifier) => {
      const identifiers = identifier.split(".");
      if (identifiers.length > prerelease.length) {
        return false;
      }
      for (let i = 0;i < identifiers.length; i++) {
        if (compareIdentifiers(prerelease[i], identifiers[i]) !== 0) {
          return false;
        }
      }
      return true;
    };

    class SemVer {
      constructor(version, options) {
        options = parseOptions(options);
        if (version instanceof SemVer) {
          if (version.loose === !!options.loose && version.includePrerelease === !!options.includePrerelease) {
            return version;
          } else {
            version = version.version;
          }
        } else if (typeof version !== "string") {
          throw new TypeError(`Invalid version. Must be a string. Got type "${typeof version}".`);
        }
        if (version.length > MAX_LENGTH) {
          throw new TypeError(`version is longer than ${MAX_LENGTH} characters`);
        }
        debug("SemVer", version, options);
        this.options = options;
        this.loose = !!options.loose;
        this.includePrerelease = !!options.includePrerelease;
        const m = version.trim().match(options.loose ? re[t.LOOSE] : re[t.FULL]);
        if (!m) {
          throw new TypeError(`Invalid Version: ${version}`);
        }
        this.raw = version;
        this.major = +m[1];
        this.minor = +m[2];
        this.patch = +m[3];
        if (this.major > MAX_SAFE_INTEGER || this.major < 0) {
          throw new TypeError("Invalid major version");
        }
        if (this.minor > MAX_SAFE_INTEGER || this.minor < 0) {
          throw new TypeError("Invalid minor version");
        }
        if (this.patch > MAX_SAFE_INTEGER || this.patch < 0) {
          throw new TypeError("Invalid patch version");
        }
        if (!m[4]) {
          this.prerelease = [];
        } else {
          this.prerelease = m[4].split(".").map((id) => {
            if (/^[0-9]+$/.test(id)) {
              const num = +id;
              if (num >= 0 && num < MAX_SAFE_INTEGER) {
                return num;
              }
            }
            return id;
          });
        }
        this.build = m[5] ? m[5].split(".") : [];
        this.format();
      }
      format() {
        this.version = `${this.major}.${this.minor}.${this.patch}`;
        if (this.prerelease.length) {
          this.version += `-${this.prerelease.join(".")}`;
        }
        return this.version;
      }
      toString() {
        return this.version;
      }
      compare(other) {
        debug("SemVer.compare", this.version, this.options, other);
        if (!(other instanceof SemVer)) {
          if (typeof other === "string" && other === this.version) {
            return 0;
          }
          other = new SemVer(other, this.options);
        }
        if (other.version === this.version) {
          return 0;
        }
        return this.compareMain(other) || this.comparePre(other);
      }
      compareMain(other) {
        if (!(other instanceof SemVer)) {
          other = new SemVer(other, this.options);
        }
        if (this.major < other.major) {
          return -1;
        }
        if (this.major > other.major) {
          return 1;
        }
        if (this.minor < other.minor) {
          return -1;
        }
        if (this.minor > other.minor) {
          return 1;
        }
        if (this.patch < other.patch) {
          return -1;
        }
        if (this.patch > other.patch) {
          return 1;
        }
        return 0;
      }
      comparePre(other) {
        if (!(other instanceof SemVer)) {
          other = new SemVer(other, this.options);
        }
        if (this.prerelease.length && !other.prerelease.length) {
          return -1;
        } else if (!this.prerelease.length && other.prerelease.length) {
          return 1;
        } else if (!this.prerelease.length && !other.prerelease.length) {
          return 0;
        }
        let i = 0;
        do {
          const a = this.prerelease[i];
          const b = other.prerelease[i];
          debug("prerelease compare", i, a, b);
          if (a === undefined && b === undefined) {
            return 0;
          } else if (b === undefined) {
            return 1;
          } else if (a === undefined) {
            return -1;
          } else if (a === b) {
            continue;
          } else {
            return compareIdentifiers(a, b);
          }
        } while (++i);
      }
      compareBuild(other) {
        if (!(other instanceof SemVer)) {
          other = new SemVer(other, this.options);
        }
        let i = 0;
        do {
          const a = this.build[i];
          const b = other.build[i];
          debug("build compare", i, a, b);
          if (a === undefined && b === undefined) {
            return 0;
          } else if (b === undefined) {
            return 1;
          } else if (a === undefined) {
            return -1;
          } else if (a === b) {
            continue;
          } else {
            return compareIdentifiers(a, b);
          }
        } while (++i);
      }
      inc(release, identifier, identifierBase) {
        if (release.startsWith("pre")) {
          if (!identifier && identifierBase === false) {
            throw new Error("invalid increment argument: identifier is empty");
          }
          if (identifier) {
            const match = `-${identifier}`.match(this.options.loose ? re[t.PRERELEASELOOSE] : re[t.PRERELEASE]);
            if (!match || match[1] !== identifier) {
              throw new Error(`invalid identifier: ${identifier}`);
            }
          }
        }
        switch (release) {
          case "premajor":
            this.prerelease.length = 0;
            this.patch = 0;
            this.minor = 0;
            this.major++;
            this.inc("pre", identifier, identifierBase);
            break;
          case "preminor":
            this.prerelease.length = 0;
            this.patch = 0;
            this.minor++;
            this.inc("pre", identifier, identifierBase);
            break;
          case "prepatch":
            this.prerelease.length = 0;
            this.inc("patch", identifier, identifierBase);
            this.inc("pre", identifier, identifierBase);
            break;
          case "prerelease":
            if (this.prerelease.length === 0) {
              this.inc("patch", identifier, identifierBase);
            }
            this.inc("pre", identifier, identifierBase);
            break;
          case "release":
            if (this.prerelease.length === 0) {
              throw new Error(`version ${this.raw} is not a prerelease`);
            }
            this.prerelease.length = 0;
            break;
          case "major":
            if (this.minor !== 0 || this.patch !== 0 || this.prerelease.length === 0) {
              this.major++;
            }
            this.minor = 0;
            this.patch = 0;
            this.prerelease = [];
            break;
          case "minor":
            if (this.patch !== 0 || this.prerelease.length === 0) {
              this.minor++;
            }
            this.patch = 0;
            this.prerelease = [];
            break;
          case "patch":
            if (this.prerelease.length === 0) {
              this.patch++;
            }
            this.prerelease = [];
            break;
          case "pre": {
            const base = Number(identifierBase) ? 1 : 0;
            if (this.prerelease.length === 0) {
              this.prerelease = [base];
            } else {
              let i = this.prerelease.length;
              while (--i >= 0) {
                if (typeof this.prerelease[i] === "number") {
                  this.prerelease[i]++;
                  i = -2;
                }
              }
              if (i === -1) {
                if (identifier === this.prerelease.join(".") && identifierBase === false) {
                  throw new Error("invalid increment argument: identifier already exists");
                }
                this.prerelease.push(base);
              }
            }
            if (identifier) {
              let prerelease = [identifier, base];
              if (identifierBase === false) {
                prerelease = [identifier];
              }
              if (isPrereleaseIdentifier(this.prerelease, identifier)) {
                const prereleaseBase = this.prerelease[identifier.split(".").length];
                if (isNaN(prereleaseBase)) {
                  this.prerelease = prerelease;
                }
              } else {
                this.prerelease = prerelease;
              }
            }
            break;
          }
          default:
            throw new Error(`invalid increment argument: ${release}`);
        }
        this.raw = this.format();
        if (this.build.length) {
          this.raw += `+${this.build.join(".")}`;
        }
        return this;
      }
    }
    module.exports = SemVer;
  });

  // node_modules/semver/functions/parse.js
  var require_parse = __commonJS(function(exports, module) {
    var SemVer = require_semver();
    var parse = (version, options, throwErrors = false) => {
      if (version instanceof SemVer) {
        return version;
      }
      try {
        return new SemVer(version, options);
      } catch (er) {
        if (!throwErrors) {
          return null;
        }
        throw er;
      }
    };
    module.exports = parse;
  });

  // node_modules/semver/functions/valid.js
  var require_valid = __commonJS(function(exports, module) {
    var parse = require_parse();
    var valid = (version, options) => {
      const v = parse(version, options);
      return v ? v.version : null;
    };
    module.exports = valid;
  });

  // node_modules/semver/functions/clean.js
  var require_clean = __commonJS(function(exports, module) {
    var parse = require_parse();
    var clean = (version, options) => {
      const s = parse(version.trim().replace(/^[=v]+/, ""), options);
      return s ? s.version : null;
    };
    module.exports = clean;
  });

  // node_modules/semver/functions/inc.js
  var require_inc = __commonJS(function(exports, module) {
    var SemVer = require_semver();
    var inc = (version, release, options, identifier, identifierBase) => {
      if (typeof options === "string") {
        identifierBase = identifier;
        identifier = options;
        options = undefined;
      }
      try {
        return new SemVer(version instanceof SemVer ? version.version : version, options).inc(release, identifier, identifierBase).version;
      } catch (er) {
        return null;
      }
    };
    module.exports = inc;
  });

  // node_modules/semver/functions/diff.js
  var require_diff = __commonJS(function(exports, module) {
    var parse = require_parse();
    var diff = (version1, version2) => {
      const v1 = parse(version1, null, true);
      const v2 = parse(version2, null, true);
      const comparison = v1.compare(v2);
      if (comparison === 0) {
        return null;
      }
      const v1Higher = comparison > 0;
      const highVersion = v1Higher ? v1 : v2;
      const lowVersion = v1Higher ? v2 : v1;
      const highHasPre = !!highVersion.prerelease.length;
      const lowHasPre = !!lowVersion.prerelease.length;
      if (lowHasPre && !highHasPre) {
        if (!lowVersion.patch && !lowVersion.minor) {
          return "major";
        }
        if (lowVersion.compareMain(highVersion) === 0) {
          if (lowVersion.minor && !lowVersion.patch) {
            return "minor";
          }
          return "patch";
        }
      }
      const prefix = highHasPre ? "pre" : "";
      if (v1.major !== v2.major) {
        return prefix + "major";
      }
      if (v1.minor !== v2.minor) {
        return prefix + "minor";
      }
      if (v1.patch !== v2.patch) {
        return prefix + "patch";
      }
      return "prerelease";
    };
    module.exports = diff;
  });

  // node_modules/semver/functions/major.js
  var require_major = __commonJS(function(exports, module) {
    var SemVer = require_semver();
    var major = (a, loose) => new SemVer(a, loose).major;
    module.exports = major;
  });

  // node_modules/semver/functions/minor.js
  var require_minor = __commonJS(function(exports, module) {
    var SemVer = require_semver();
    var minor = (a, loose) => new SemVer(a, loose).minor;
    module.exports = minor;
  });

  // node_modules/semver/functions/patch.js
  var require_patch = __commonJS(function(exports, module) {
    var SemVer = require_semver();
    var patch = (a, loose) => new SemVer(a, loose).patch;
    module.exports = patch;
  });

  // node_modules/semver/functions/prerelease.js
  var require_prerelease = __commonJS(function(exports, module) {
    var parse = require_parse();
    var prerelease = (version, options) => {
      const parsed = parse(version, options);
      return parsed && parsed.prerelease.length ? parsed.prerelease : null;
    };
    module.exports = prerelease;
  });

  // node_modules/semver/functions/compare.js
  var require_compare = __commonJS(function(exports, module) {
    var SemVer = require_semver();
    var compare = (a, b, loose) => new SemVer(a, loose).compare(new SemVer(b, loose));
    module.exports = compare;
  });

  // node_modules/semver/functions/rcompare.js
  var require_rcompare = __commonJS(function(exports, module) {
    var compare = require_compare();
    var rcompare = (a, b, loose) => compare(b, a, loose);
    module.exports = rcompare;
  });

  // node_modules/semver/functions/compare-loose.js
  var require_compare_loose = __commonJS(function(exports, module) {
    var compare = require_compare();
    var compareLoose = (a, b) => compare(a, b, true);
    module.exports = compareLoose;
  });

  // node_modules/semver/functions/compare-build.js
  var require_compare_build = __commonJS(function(exports, module) {
    var SemVer = require_semver();
    var compareBuild = (a, b, loose) => {
      const versionA = new SemVer(a, loose);
      const versionB = new SemVer(b, loose);
      return versionA.compare(versionB) || versionA.compareBuild(versionB);
    };
    module.exports = compareBuild;
  });

  // node_modules/semver/functions/sort.js
  var require_sort = __commonJS(function(exports, module) {
    var compareBuild = require_compare_build();
    var sort = (list, loose) => list.sort((a, b) => compareBuild(a, b, loose));
    module.exports = sort;
  });

  // node_modules/semver/functions/rsort.js
  var require_rsort = __commonJS(function(exports, module) {
    var compareBuild = require_compare_build();
    var rsort = (list, loose) => list.sort((a, b) => compareBuild(b, a, loose));
    module.exports = rsort;
  });

  // node_modules/semver/functions/gt.js
  var require_gt = __commonJS(function(exports, module) {
    var compare = require_compare();
    var gt = (a, b, loose) => compare(a, b, loose) > 0;
    module.exports = gt;
  });

  // node_modules/semver/functions/lt.js
  var require_lt = __commonJS(function(exports, module) {
    var compare = require_compare();
    var lt = (a, b, loose) => compare(a, b, loose) < 0;
    module.exports = lt;
  });

  // node_modules/semver/functions/eq.js
  var require_eq = __commonJS(function(exports, module) {
    var compare = require_compare();
    var eq = (a, b, loose) => compare(a, b, loose) === 0;
    module.exports = eq;
  });

  // node_modules/semver/functions/neq.js
  var require_neq = __commonJS(function(exports, module) {
    var compare = require_compare();
    var neq = (a, b, loose) => compare(a, b, loose) !== 0;
    module.exports = neq;
  });

  // node_modules/semver/functions/gte.js
  var require_gte = __commonJS(function(exports, module) {
    var compare = require_compare();
    var gte = (a, b, loose) => compare(a, b, loose) >= 0;
    module.exports = gte;
  });

  // node_modules/semver/functions/lte.js
  var require_lte = __commonJS(function(exports, module) {
    var compare = require_compare();
    var lte = (a, b, loose) => compare(a, b, loose) <= 0;
    module.exports = lte;
  });

  // node_modules/semver/functions/cmp.js
  var require_cmp = __commonJS(function(exports, module) {
    var eq = require_eq();
    var neq = require_neq();
    var gt = require_gt();
    var gte = require_gte();
    var lt = require_lt();
    var lte = require_lte();
    var cmp = (a, op, b, loose) => {
      switch (op) {
        case "===":
          if (typeof a === "object") {
            a = a.version;
          }
          if (typeof b === "object") {
            b = b.version;
          }
          return a === b;
        case "!==":
          if (typeof a === "object") {
            a = a.version;
          }
          if (typeof b === "object") {
            b = b.version;
          }
          return a !== b;
        case "":
        case "=":
        case "==":
          return eq(a, b, loose);
        case "!=":
          return neq(a, b, loose);
        case ">":
          return gt(a, b, loose);
        case ">=":
          return gte(a, b, loose);
        case "<":
          return lt(a, b, loose);
        case "<=":
          return lte(a, b, loose);
        default:
          throw new TypeError(`Invalid operator: ${op}`);
      }
    };
    module.exports = cmp;
  });

  // node_modules/semver/functions/coerce.js
  var require_coerce = __commonJS(function(exports, module) {
    var SemVer = require_semver();
    var parse = require_parse();
    var { safeRe: re, t } = require_re();
    var coerce = (version, options) => {
      if (version instanceof SemVer) {
        return version;
      }
      if (typeof version === "number") {
        version = String(version);
      }
      if (typeof version !== "string") {
        return null;
      }
      options = options || {};
      let match = null;
      if (!options.rtl) {
        match = version.match(options.includePrerelease ? re[t.COERCEFULL] : re[t.COERCE]);
      } else {
        const coerceRtlRegex = options.includePrerelease ? re[t.COERCERTLFULL] : re[t.COERCERTL];
        let next;
        while ((next = coerceRtlRegex.exec(version)) && (!match || match.index + match[0].length !== version.length)) {
          if (!match || next.index + next[0].length !== match.index + match[0].length) {
            match = next;
          }
          coerceRtlRegex.lastIndex = next.index + next[1].length + next[2].length;
        }
        coerceRtlRegex.lastIndex = -1;
      }
      if (match === null) {
        return null;
      }
      const major = match[2];
      const minor = match[3] || "0";
      const patch = match[4] || "0";
      const prerelease = options.includePrerelease && match[5] ? `-${match[5]}` : "";
      const build = options.includePrerelease && match[6] ? `+${match[6]}` : "";
      return parse(`${major}.${minor}.${patch}${prerelease}${build}`, options);
    };
    module.exports = coerce;
  });

  // node_modules/semver/functions/truncate.js
  var require_truncate = __commonJS(function(exports, module) {
    var parse = require_parse();
    var constants = require_constants();
    var SemVer = require_semver();
    var truncate = (version, truncation, options) => {
      if (!constants.RELEASE_TYPES.includes(truncation)) {
        return null;
      }
      const clonedVersion = cloneInputVersion(version, options);
      return clonedVersion && doTruncation(clonedVersion, truncation);
    };
    var cloneInputVersion = (version, options) => {
      const versionStringToParse = version instanceof SemVer ? version.version : version;
      return parse(versionStringToParse, options);
    };
    var doTruncation = (version, truncation) => {
      if (isPrerelease(truncation)) {
        return version.version;
      }
      version.prerelease = [];
      switch (truncation) {
        case "major":
          version.minor = 0;
          version.patch = 0;
          break;
        case "minor":
          version.patch = 0;
          break;
      }
      return version.format();
    };
    var isPrerelease = (type) => {
      return type.startsWith("pre");
    };
    module.exports = truncate;
  });

  // node_modules/semver/internal/lrucache.js
  var require_lrucache = __commonJS(function(exports, module) {
    class LRUCache {
      constructor() {
        this.max = 1000;
        this.map = new Map;
      }
      get(key) {
        const value = this.map.get(key);
        if (value === undefined) {
          return;
        } else {
          this.map.delete(key);
          this.map.set(key, value);
          return value;
        }
      }
      delete(key) {
        return this.map.delete(key);
      }
      set(key, value) {
        const deleted = this.delete(key);
        if (!deleted && value !== undefined) {
          if (this.map.size >= this.max) {
            const firstKey = this.map.keys().next().value;
            this.delete(firstKey);
          }
          this.map.set(key, value);
        }
        return this;
      }
    }
    module.exports = LRUCache;
  });

  // node_modules/semver/classes/range.js
  var require_range = __commonJS(function(exports, module) {
    var SPACE_CHARACTERS = /\s+/g;

    class Range {
      constructor(range, options) {
        options = parseOptions(options);
        if (range instanceof Range) {
          if (range.loose === !!options.loose && range.includePrerelease === !!options.includePrerelease) {
            return range;
          } else {
            return new Range(range.raw, options);
          }
        }
        if (range instanceof Comparator) {
          this.raw = range.value;
          this.set = [[range]];
          this.formatted = undefined;
          return this;
        }
        this.options = options;
        this.loose = !!options.loose;
        this.includePrerelease = !!options.includePrerelease;
        this.raw = range.trim().replace(SPACE_CHARACTERS, " ");
        this.set = this.raw.split("||").map((r) => this.parseRange(r.trim())).filter((c) => c.length);
        if (!this.set.length) {
          throw new TypeError(`Invalid SemVer Range: ${this.raw}`);
        }
        if (this.set.length > 1) {
          const first = this.set[0];
          this.set = this.set.filter((c) => !isNullSet(c[0]));
          if (this.set.length === 0) {
            this.set = [first];
          } else if (this.set.length > 1) {
            for (const c of this.set) {
              if (c.length === 1 && isAny(c[0])) {
                this.set = [c];
                break;
              }
            }
          }
        }
        this.formatted = undefined;
      }
      get range() {
        if (this.formatted === undefined) {
          this.formatted = "";
          for (let i = 0;i < this.set.length; i++) {
            if (i > 0) {
              this.formatted += "||";
            }
            const comps = this.set[i];
            for (let k = 0;k < comps.length; k++) {
              if (k > 0) {
                this.formatted += " ";
              }
              this.formatted += comps[k].toString().trim();
            }
          }
        }
        return this.formatted;
      }
      format() {
        return this.range;
      }
      toString() {
        return this.range;
      }
      parseRange(range) {
        range = range.replace(BUILDSTRIPRE, "");
        const memoOpts = (this.options.includePrerelease && FLAG_INCLUDE_PRERELEASE) | (this.options.loose && FLAG_LOOSE);
        const memoKey = memoOpts + ":" + range;
        const cached = cache.get(memoKey);
        if (cached) {
          return cached;
        }
        const loose = this.options.loose;
        const hr = loose ? re[t.HYPHENRANGELOOSE] : re[t.HYPHENRANGE];
        range = range.replace(hr, hyphenReplace(this.options.includePrerelease));
        debug("hyphen replace", range);
        range = range.replace(re[t.COMPARATORTRIM], comparatorTrimReplace);
        debug("comparator trim", range);
        range = range.replace(re[t.TILDETRIM], tildeTrimReplace);
        debug("tilde trim", range);
        range = range.replace(re[t.CARETTRIM], caretTrimReplace);
        debug("caret trim", range);
        let rangeList = range.split(" ").map((comp) => parseComparator(comp, this.options)).join(" ").split(/\s+/).map((comp) => replaceGTE0(comp, this.options));
        if (loose) {
          rangeList = rangeList.filter((comp) => {
            debug("loose invalid filter", comp, this.options);
            return !!comp.match(re[t.COMPARATORLOOSE]);
          });
        }
        debug("range list", rangeList);
        const rangeMap = new Map;
        const comparators = rangeList.map((comp) => new Comparator(comp, this.options));
        for (const comp of comparators) {
          if (isNullSet(comp)) {
            return [comp];
          }
          rangeMap.set(comp.value, comp);
        }
        if (rangeMap.size > 1 && rangeMap.has("")) {
          rangeMap.delete("");
        }
        const result = [...rangeMap.values()];
        cache.set(memoKey, result);
        return result;
      }
      intersects(range, options) {
        if (!(range instanceof Range)) {
          throw new TypeError("a Range is required");
        }
        return this.set.some((thisComparators) => {
          return isSatisfiable(thisComparators, options) && range.set.some((rangeComparators) => {
            return isSatisfiable(rangeComparators, options) && thisComparators.every((thisComparator) => {
              return rangeComparators.every((rangeComparator) => {
                return thisComparator.intersects(rangeComparator, options);
              });
            });
          });
        });
      }
      test(version) {
        if (!version) {
          return false;
        }
        if (typeof version === "string") {
          try {
            version = new SemVer(version, this.options);
          } catch (er) {
            return false;
          }
        }
        for (let i = 0;i < this.set.length; i++) {
          if (testSet(this.set[i], version, this.options)) {
            return true;
          }
        }
        return false;
      }
    }
    module.exports = Range;
    var LRU = require_lrucache();
    var cache = new LRU;
    var parseOptions = require_parse_options();
    var Comparator = require_comparator();
    var debug = require_debug();
    var SemVer = require_semver();
    var {
      safeRe: re,
      src,
      t,
      comparatorTrimReplace,
      tildeTrimReplace,
      caretTrimReplace
    } = require_re();
    var { FLAG_INCLUDE_PRERELEASE, FLAG_LOOSE } = require_constants();
    var BUILDSTRIPRE = new RegExp(src[t.BUILD], "g");
    var isNullSet = (c) => c.value === "<0.0.0-0";
    var isAny = (c) => c.value === "";
    var isSatisfiable = (comparators, options) => {
      let result = true;
      const remainingComparators = comparators.slice();
      let testComparator = remainingComparators.pop();
      while (result && remainingComparators.length) {
        result = remainingComparators.every((otherComparator) => {
          return testComparator.intersects(otherComparator, options);
        });
        testComparator = remainingComparators.pop();
      }
      return result;
    };
    var parseComparator = (comp, options) => {
      comp = comp.replace(re[t.BUILD], "");
      debug("comp", comp, options);
      comp = replaceCarets(comp, options);
      debug("caret", comp);
      comp = replaceTildes(comp, options);
      debug("tildes", comp);
      comp = replaceXRanges(comp, options);
      debug("xrange", comp);
      comp = replaceStars(comp, options);
      debug("stars", comp);
      return comp;
    };
    var isX = (id) => !id || id.toLowerCase() === "x" || id === "*";
    var invalidXRangeOrder = (M, m, p) => isX(M) && !isX(m) || isX(m) && p && !isX(p);
    var replaceTildes = (comp, options) => {
      return comp.trim().split(/\s+/).map((c) => replaceTilde(c, options)).join(" ");
    };
    var replaceTilde = (comp, options) => {
      const r = options.loose ? re[t.TILDELOOSE] : re[t.TILDE];
      const z = options.includePrerelease ? "-0" : "";
      return comp.replace(r, (_, M, m, p, pr) => {
        debug("tilde", comp, _, M, m, p, pr);
        let ret;
        if (isX(M)) {
          ret = "";
        } else if (isX(m)) {
          ret = `>=${M}.0.0${z} <${+M + 1}.0.0-0`;
        } else if (isX(p)) {
          ret = `>=${M}.${m}.0${z} <${M}.${+m + 1}.0-0`;
        } else if (pr) {
          debug("replaceTilde pr", pr);
          ret = `>=${M}.${m}.${p}-${pr} <${M}.${+m + 1}.0-0`;
        } else {
          ret = `>=${M}.${m}.${p} <${M}.${+m + 1}.0-0`;
        }
        debug("tilde return", ret);
        return ret;
      });
    };
    var replaceCarets = (comp, options) => {
      return comp.trim().split(/\s+/).map((c) => replaceCaret(c, options)).join(" ");
    };
    var replaceCaret = (comp, options) => {
      debug("caret", comp, options);
      const r = options.loose ? re[t.CARETLOOSE] : re[t.CARET];
      const z = options.includePrerelease ? "-0" : "";
      return comp.replace(r, (_, M, m, p, pr) => {
        debug("caret", comp, _, M, m, p, pr);
        let ret;
        if (isX(M)) {
          ret = "";
        } else if (isX(m)) {
          ret = `>=${M}.0.0${z} <${+M + 1}.0.0-0`;
        } else if (isX(p)) {
          if (M === "0") {
            ret = `>=${M}.${m}.0${z} <${M}.${+m + 1}.0-0`;
          } else {
            ret = `>=${M}.${m}.0${z} <${+M + 1}.0.0-0`;
          }
        } else if (pr) {
          debug("replaceCaret pr", pr);
          if (M === "0") {
            if (m === "0") {
              ret = `>=${M}.${m}.${p}-${pr} <${M}.${m}.${+p + 1}-0`;
            } else {
              ret = `>=${M}.${m}.${p}-${pr} <${M}.${+m + 1}.0-0`;
            }
          } else {
            ret = `>=${M}.${m}.${p}-${pr} <${+M + 1}.0.0-0`;
          }
        } else {
          debug("no pr");
          if (M === "0") {
            if (m === "0") {
              ret = `>=${M}.${m}.${p} <${M}.${m}.${+p + 1}-0`;
            } else {
              ret = `>=${M}.${m}.${p} <${M}.${+m + 1}.0-0`;
            }
          } else {
            ret = `>=${M}.${m}.${p} <${+M + 1}.0.0-0`;
          }
        }
        debug("caret return", ret);
        return ret;
      });
    };
    var replaceXRanges = (comp, options) => {
      debug("replaceXRanges", comp, options);
      return comp.split(/\s+/).map((c) => replaceXRange(c, options)).join(" ");
    };
    var replaceXRange = (comp, options) => {
      comp = comp.trim();
      const r = options.loose ? re[t.XRANGELOOSE] : re[t.XRANGE];
      return comp.replace(r, (ret, gtlt, M, m, p, pr) => {
        debug("xRange", comp, ret, gtlt, M, m, p, pr);
        if (invalidXRangeOrder(M, m, p)) {
          return comp;
        }
        const xM = isX(M);
        const xm = xM || isX(m);
        const xp = xm || isX(p);
        const anyX = xp;
        if (gtlt === "=" && anyX) {
          gtlt = "";
        }
        pr = options.includePrerelease ? "-0" : "";
        if (xM) {
          if (gtlt === ">" || gtlt === "<") {
            ret = "<0.0.0-0";
          } else {
            ret = "*";
          }
        } else if (gtlt && anyX) {
          if (xm) {
            m = 0;
          }
          p = 0;
          if (gtlt === ">") {
            gtlt = ">=";
            if (xm) {
              M = +M + 1;
              m = 0;
              p = 0;
            } else {
              m = +m + 1;
              p = 0;
            }
          } else if (gtlt === "<=") {
            gtlt = "<";
            if (xm) {
              M = +M + 1;
            } else {
              m = +m + 1;
            }
          }
          if (gtlt === "<") {
            pr = "-0";
          }
          ret = `${gtlt + M}.${m}.${p}${pr}`;
        } else if (xm) {
          ret = `>=${M}.0.0${pr} <${+M + 1}.0.0-0`;
        } else if (xp) {
          ret = `>=${M}.${m}.0${pr} <${M}.${+m + 1}.0-0`;
        }
        debug("xRange return", ret);
        return ret;
      });
    };
    var replaceStars = (comp, options) => {
      debug("replaceStars", comp, options);
      return comp.trim().replace(re[t.STAR], "");
    };
    var replaceGTE0 = (comp, options) => {
      debug("replaceGTE0", comp, options);
      return comp.trim().replace(re[options.includePrerelease ? t.GTE0PRE : t.GTE0], "");
    };
    var hyphenReplace = (incPr) => ($0, from, fM, fm, fp, fpr, fb, to, tM, tm, tp, tpr) => {
      if (isX(fM)) {
        from = "";
      } else if (isX(fm)) {
        from = `>=${fM}.0.0${incPr ? "-0" : ""}`;
      } else if (isX(fp)) {
        from = `>=${fM}.${fm}.0${incPr ? "-0" : ""}`;
      } else if (fpr) {
        from = `>=${from}`;
      } else {
        from = `>=${from}${incPr ? "-0" : ""}`;
      }
      if (isX(tM)) {
        to = "";
      } else if (isX(tm)) {
        to = `<${+tM + 1}.0.0-0`;
      } else if (isX(tp)) {
        to = `<${tM}.${+tm + 1}.0-0`;
      } else if (tpr) {
        to = `<=${tM}.${tm}.${tp}-${tpr}`;
      } else if (incPr) {
        to = `<${tM}.${tm}.${+tp + 1}-0`;
      } else {
        to = `<=${to}`;
      }
      return `${from} ${to}`.trim();
    };
    var testSet = (set, version, options) => {
      for (let i = 0;i < set.length; i++) {
        if (!set[i].test(version)) {
          return false;
        }
      }
      if (version.prerelease.length && !options.includePrerelease) {
        for (let i = 0;i < set.length; i++) {
          debug(set[i].semver);
          if (set[i].semver === Comparator.ANY) {
            continue;
          }
          if (set[i].semver.prerelease.length > 0) {
            const allowed = set[i].semver;
            if (allowed.major === version.major && allowed.minor === version.minor && allowed.patch === version.patch) {
              return true;
            }
          }
        }
        return false;
      }
      return true;
    };
  });

  // node_modules/semver/classes/comparator.js
  var require_comparator = __commonJS(function(exports, module) {
    var ANY = Symbol("SemVer ANY");

    class Comparator {
      static get ANY() {
        return ANY;
      }
      constructor(comp, options) {
        options = parseOptions(options);
        if (comp instanceof Comparator) {
          if (comp.loose === !!options.loose) {
            return comp;
          } else {
            comp = comp.value;
          }
        }
        comp = comp.trim().split(/\s+/).join(" ");
        debug("comparator", comp, options);
        this.options = options;
        this.loose = !!options.loose;
        this.parse(comp);
        if (this.semver === ANY) {
          this.value = "";
        } else {
          this.value = this.operator + this.semver.version;
        }
        debug("comp", this);
      }
      parse(comp) {
        const r = this.options.loose ? re[t.COMPARATORLOOSE] : re[t.COMPARATOR];
        const m = comp.match(r);
        if (!m) {
          throw new TypeError(`Invalid comparator: ${comp}`);
        }
        this.operator = m[1] !== undefined ? m[1] : "";
        if (this.operator === "=") {
          this.operator = "";
        }
        if (!m[2]) {
          this.semver = ANY;
        } else {
          this.semver = new SemVer(m[2], this.options.loose);
        }
      }
      toString() {
        return this.value;
      }
      test(version) {
        debug("Comparator.test", version, this.options.loose);
        if (this.semver === ANY || version === ANY) {
          return true;
        }
        if (typeof version === "string") {
          try {
            version = new SemVer(version, this.options);
          } catch (er) {
            return false;
          }
        }
        return cmp(version, this.operator, this.semver, this.options);
      }
      intersects(comp, options) {
        if (!(comp instanceof Comparator)) {
          throw new TypeError("a Comparator is required");
        }
        if (this.operator === "") {
          if (this.value === "") {
            return true;
          }
          return new Range(comp.value, options).test(this.value);
        } else if (comp.operator === "") {
          if (comp.value === "") {
            return true;
          }
          return new Range(this.value, options).test(comp.semver);
        }
        options = parseOptions(options);
        if (options.includePrerelease && (this.value === "<0.0.0-0" || comp.value === "<0.0.0-0")) {
          return false;
        }
        if (!options.includePrerelease && (this.value.startsWith("<0.0.0") || comp.value.startsWith("<0.0.0"))) {
          return false;
        }
        if (this.operator.startsWith(">") && comp.operator.startsWith(">")) {
          return true;
        }
        if (this.operator.startsWith("<") && comp.operator.startsWith("<")) {
          return true;
        }
        if (this.semver.version === comp.semver.version && this.operator.includes("=") && comp.operator.includes("=")) {
          return true;
        }
        if (cmp(this.semver, "<", comp.semver, options) && this.operator.startsWith(">") && comp.operator.startsWith("<")) {
          return true;
        }
        if (cmp(this.semver, ">", comp.semver, options) && this.operator.startsWith("<") && comp.operator.startsWith(">")) {
          return true;
        }
        return false;
      }
    }
    module.exports = Comparator;
    var parseOptions = require_parse_options();
    var { safeRe: re, t } = require_re();
    var cmp = require_cmp();
    var debug = require_debug();
    var SemVer = require_semver();
    var Range = require_range();
  });

  // node_modules/semver/functions/satisfies.js
  var require_satisfies = __commonJS(function(exports, module) {
    var Range = require_range();
    var satisfies = (version, range, options) => {
      try {
        range = new Range(range, options);
      } catch (er) {
        return false;
      }
      return range.test(version);
    };
    module.exports = satisfies;
  });

  // node_modules/semver/ranges/to-comparators.js
  var require_to_comparators = __commonJS(function(exports, module) {
    var Range = require_range();
    var toComparators = (range, options) => new Range(range, options).set.map((comp) => comp.map((c) => c.value).join(" ").trim().split(" "));
    module.exports = toComparators;
  });

  // node_modules/semver/ranges/max-satisfying.js
  var require_max_satisfying = __commonJS(function(exports, module) {
    var SemVer = require_semver();
    var Range = require_range();
    var maxSatisfying = (versions, range, options) => {
      let max = null;
      let maxSV = null;
      let rangeObj = null;
      try {
        rangeObj = new Range(range, options);
      } catch (er) {
        return null;
      }
      versions.forEach((v) => {
        if (rangeObj.test(v)) {
          if (!max || maxSV.compare(v) === -1) {
            max = v;
            maxSV = new SemVer(max, options);
          }
        }
      });
      return max;
    };
    module.exports = maxSatisfying;
  });

  // node_modules/semver/ranges/min-satisfying.js
  var require_min_satisfying = __commonJS(function(exports, module) {
    var SemVer = require_semver();
    var Range = require_range();
    var minSatisfying = (versions, range, options) => {
      let min = null;
      let minSV = null;
      let rangeObj = null;
      try {
        rangeObj = new Range(range, options);
      } catch (er) {
        return null;
      }
      versions.forEach((v) => {
        if (rangeObj.test(v)) {
          if (!min || minSV.compare(v) === 1) {
            min = v;
            minSV = new SemVer(min, options);
          }
        }
      });
      return min;
    };
    module.exports = minSatisfying;
  });

  // node_modules/semver/ranges/min-version.js
  var require_min_version = __commonJS(function(exports, module) {
    var SemVer = require_semver();
    var Range = require_range();
    var gt = require_gt();
    var minVersion = (range, loose) => {
      range = new Range(range, loose);
      let minver = new SemVer("0.0.0");
      if (range.test(minver)) {
        return minver;
      }
      minver = new SemVer("0.0.0-0");
      if (range.test(minver)) {
        return minver;
      }
      minver = null;
      for (let i = 0;i < range.set.length; ++i) {
        const comparators = range.set[i];
        let setMin = null;
        comparators.forEach((comparator) => {
          const compver = new SemVer(comparator.semver.version);
          switch (comparator.operator) {
            case ">":
              if (compver.prerelease.length === 0) {
                compver.patch++;
              } else {
                compver.prerelease.push(0);
              }
              compver.raw = compver.format();
            case "":
            case ">=":
              if (!setMin || gt(compver, setMin)) {
                setMin = compver;
              }
              break;
            case "<":
            case "<=":
              break;
            default:
              throw new Error(`Unexpected operation: ${comparator.operator}`);
          }
        });
        if (setMin && (!minver || gt(minver, setMin))) {
          minver = setMin;
        }
      }
      if (minver && range.test(minver)) {
        return minver;
      }
      return null;
    };
    module.exports = minVersion;
  });

  // node_modules/semver/ranges/valid.js
  var require_valid2 = __commonJS(function(exports, module) {
    var Range = require_range();
    var validRange = (range, options) => {
      try {
        return new Range(range, options).range || "*";
      } catch (er) {
        return null;
      }
    };
    module.exports = validRange;
  });

  // node_modules/semver/ranges/outside.js
  var require_outside = __commonJS(function(exports, module) {
    var SemVer = require_semver();
    var Comparator = require_comparator();
    var { ANY } = Comparator;
    var Range = require_range();
    var satisfies = require_satisfies();
    var gt = require_gt();
    var lt = require_lt();
    var lte = require_lte();
    var gte = require_gte();
    var outside = (version, range, hilo, options) => {
      version = new SemVer(version, options);
      range = new Range(range, options);
      let gtfn, ltefn, ltfn, comp, ecomp;
      switch (hilo) {
        case ">":
          gtfn = gt;
          ltefn = lte;
          ltfn = lt;
          comp = ">";
          ecomp = ">=";
          break;
        case "<":
          gtfn = lt;
          ltefn = gte;
          ltfn = gt;
          comp = "<";
          ecomp = "<=";
          break;
        default:
          throw new TypeError('Must provide a hilo val of "<" or ">"');
      }
      if (satisfies(version, range, options)) {
        return false;
      }
      for (let i = 0;i < range.set.length; ++i) {
        const comparators = range.set[i];
        let high = null;
        let low = null;
        comparators.forEach((comparator) => {
          if (comparator.semver === ANY) {
            comparator = new Comparator(">=0.0.0");
          }
          high = high || comparator;
          low = low || comparator;
          if (gtfn(comparator.semver, high.semver, options)) {
            high = comparator;
          } else if (ltfn(comparator.semver, low.semver, options)) {
            low = comparator;
          }
        });
        if (high.operator === comp || high.operator === ecomp) {
          return false;
        }
        if ((!low.operator || low.operator === comp) && ltefn(version, low.semver)) {
          return false;
        } else if (low.operator === ecomp && ltfn(version, low.semver)) {
          return false;
        }
      }
      return true;
    };
    module.exports = outside;
  });

  // node_modules/semver/ranges/gtr.js
  var require_gtr = __commonJS(function(exports, module) {
    var outside = require_outside();
    var gtr = (version, range, options) => outside(version, range, ">", options);
    module.exports = gtr;
  });

  // node_modules/semver/ranges/ltr.js
  var require_ltr = __commonJS(function(exports, module) {
    var outside = require_outside();
    var ltr = (version, range, options) => outside(version, range, "<", options);
    module.exports = ltr;
  });

  // node_modules/semver/ranges/intersects.js
  var require_intersects = __commonJS(function(exports, module) {
    var Range = require_range();
    var intersects = (r1, r2, options) => {
      r1 = new Range(r1, options);
      r2 = new Range(r2, options);
      return r1.intersects(r2, options);
    };
    module.exports = intersects;
  });

  // node_modules/semver/ranges/simplify.js
  var require_simplify = __commonJS(function(exports, module) {
    var satisfies = require_satisfies();
    var compare = require_compare();
    module.exports = (versions, range, options) => {
      const set = [];
      let first = null;
      let prev = null;
      const v = versions.sort((a, b) => compare(a, b, options));
      for (const version of v) {
        const included = satisfies(version, range, options);
        if (included) {
          prev = version;
          if (!first) {
            first = version;
          }
        } else {
          if (prev) {
            set.push([first, prev]);
          }
          prev = null;
          first = null;
        }
      }
      if (first) {
        set.push([first, null]);
      }
      const ranges = [];
      for (const [min, max] of set) {
        if (min === max) {
          ranges.push(min);
        } else if (!max && min === v[0]) {
          ranges.push("*");
        } else if (!max) {
          ranges.push(`>=${min}`);
        } else if (min === v[0]) {
          ranges.push(`<=${max}`);
        } else {
          ranges.push(`${min} - ${max}`);
        }
      }
      const simplified = ranges.join(" || ");
      const original = typeof range.raw === "string" ? range.raw : String(range);
      return simplified.length < original.length ? simplified : range;
    };
  });

  // node_modules/semver/ranges/subset.js
  var require_subset = __commonJS(function(exports, module) {
    var Range = require_range();
    var Comparator = require_comparator();
    var { ANY } = Comparator;
    var satisfies = require_satisfies();
    var compare = require_compare();
    var subset = (sub, dom, options = {}) => {
      if (sub === dom) {
        return true;
      }
      sub = new Range(sub, options);
      dom = new Range(dom, options);
      let sawNonNull = false;
      OUTER:
        for (const simpleSub of sub.set) {
          for (const simpleDom of dom.set) {
            const isSub = simpleSubset(simpleSub, simpleDom, options);
            sawNonNull = sawNonNull || isSub !== null;
            if (isSub) {
              continue OUTER;
            }
          }
          if (sawNonNull) {
            return false;
          }
        }
      return true;
    };
    var minimumVersionWithPreRelease = [new Comparator(">=0.0.0-0")];
    var minimumVersion = [new Comparator(">=0.0.0")];
    var simpleSubset = (sub, dom, options) => {
      if (sub === dom) {
        return true;
      }
      if (sub.length === 1 && sub[0].semver === ANY) {
        if (dom.length === 1 && dom[0].semver === ANY) {
          return true;
        } else if (options.includePrerelease) {
          sub = minimumVersionWithPreRelease;
        } else {
          sub = minimumVersion;
        }
      }
      if (dom.length === 1 && dom[0].semver === ANY) {
        if (options.includePrerelease) {
          return true;
        } else {
          dom = minimumVersion;
        }
      }
      const eqSet = new Set;
      let gt, lt;
      for (const c of sub) {
        if (c.operator === ">" || c.operator === ">=") {
          gt = higherGT(gt, c, options);
        } else if (c.operator === "<" || c.operator === "<=") {
          lt = lowerLT(lt, c, options);
        } else {
          eqSet.add(c.semver);
        }
      }
      if (eqSet.size > 1) {
        return null;
      }
      let gtltComp;
      if (gt && lt) {
        gtltComp = compare(gt.semver, lt.semver, options);
        if (gtltComp > 0) {
          return null;
        } else if (gtltComp === 0 && (gt.operator !== ">=" || lt.operator !== "<=")) {
          return null;
        }
      }
      for (const eq of eqSet) {
        if (gt && !satisfies(eq, String(gt), options)) {
          return null;
        }
        if (lt && !satisfies(eq, String(lt), options)) {
          return null;
        }
        for (const c of dom) {
          if (!satisfies(eq, String(c), options)) {
            return false;
          }
        }
        return true;
      }
      let higher, lower;
      let hasDomLT, hasDomGT;
      let needDomLTPre = lt && !options.includePrerelease && lt.semver.prerelease.length ? lt.semver : false;
      let needDomGTPre = gt && !options.includePrerelease && gt.semver.prerelease.length ? gt.semver : false;
      if (needDomLTPre && needDomLTPre.prerelease.length === 1 && lt.operator === "<" && needDomLTPre.prerelease[0] === 0) {
        needDomLTPre = false;
      }
      for (const c of dom) {
        hasDomGT = hasDomGT || c.operator === ">" || c.operator === ">=";
        hasDomLT = hasDomLT || c.operator === "<" || c.operator === "<=";
        if (gt) {
          if (needDomGTPre) {
            if (c.semver.prerelease && c.semver.prerelease.length && c.semver.major === needDomGTPre.major && c.semver.minor === needDomGTPre.minor && c.semver.patch === needDomGTPre.patch) {
              needDomGTPre = false;
            }
          }
          if (c.operator === ">" || c.operator === ">=") {
            higher = higherGT(gt, c, options);
            if (higher === c && higher !== gt) {
              return false;
            }
          } else if (gt.operator === ">=" && !c.test(gt.semver)) {
            return false;
          }
        }
        if (lt) {
          if (needDomLTPre) {
            if (c.semver.prerelease && c.semver.prerelease.length && c.semver.major === needDomLTPre.major && c.semver.minor === needDomLTPre.minor && c.semver.patch === needDomLTPre.patch) {
              needDomLTPre = false;
            }
          }
          if (c.operator === "<" || c.operator === "<=") {
            lower = lowerLT(lt, c, options);
            if (lower === c && lower !== lt) {
              return false;
            }
          } else if (lt.operator === "<=" && !c.test(lt.semver)) {
            return false;
          }
        }
        if (!c.operator && (lt || gt) && gtltComp !== 0) {
          return false;
        }
      }
      if (gt && hasDomLT && !lt && gtltComp !== 0) {
        return false;
      }
      if (lt && hasDomGT && !gt && gtltComp !== 0) {
        return false;
      }
      if (needDomGTPre || needDomLTPre) {
        return false;
      }
      return true;
    };
    var higherGT = (a, b, options) => {
      if (!a) {
        return b;
      }
      const comp = compare(a.semver, b.semver, options);
      return comp > 0 ? a : comp < 0 ? b : b.operator === ">" && a.operator === ">=" ? b : a;
    };
    var lowerLT = (a, b, options) => {
      if (!a) {
        return b;
      }
      const comp = compare(a.semver, b.semver, options);
      return comp < 0 ? a : comp > 0 ? b : b.operator === "<" && a.operator === "<=" ? b : a;
    };
    module.exports = subset;
  });

  // node_modules/semver/index.js
  var require_semver2 = __commonJS(function(exports, module) {
    var internalRe = require_re();
    var constants = require_constants();
    var SemVer = require_semver();
    var identifiers = require_identifiers();
    var parse = require_parse();
    var valid = require_valid();
    var clean = require_clean();
    var inc = require_inc();
    var diff = require_diff();
    var major = require_major();
    var minor = require_minor();
    var patch = require_patch();
    var prerelease = require_prerelease();
    var compare = require_compare();
    var rcompare = require_rcompare();
    var compareLoose = require_compare_loose();
    var compareBuild = require_compare_build();
    var sort = require_sort();
    var rsort = require_rsort();
    var gt = require_gt();
    var lt = require_lt();
    var eq = require_eq();
    var neq = require_neq();
    var gte = require_gte();
    var lte = require_lte();
    var cmp = require_cmp();
    var coerce = require_coerce();
    var truncate = require_truncate();
    var Comparator = require_comparator();
    var Range = require_range();
    var satisfies = require_satisfies();
    var toComparators = require_to_comparators();
    var maxSatisfying = require_max_satisfying();
    var minSatisfying = require_min_satisfying();
    var minVersion = require_min_version();
    var validRange = require_valid2();
    var outside = require_outside();
    var gtr = require_gtr();
    var ltr = require_ltr();
    var intersects = require_intersects();
    var simplifyRange = require_simplify();
    var subset = require_subset();
    module.exports = {
      parse,
      valid,
      clean,
      inc,
      diff,
      major,
      minor,
      patch,
      prerelease,
      compare,
      rcompare,
      compareLoose,
      compareBuild,
      sort,
      rsort,
      gt,
      lt,
      eq,
      neq,
      gte,
      lte,
      cmp,
      coerce,
      truncate,
      Comparator,
      Range,
      satisfies,
      toComparators,
      maxSatisfying,
      minSatisfying,
      minVersion,
      validRange,
      outside,
      gtr,
      ltr,
      intersects,
      simplifyRange,
      subset,
      SemVer,
      re: internalRe.re,
      src: internalRe.src,
      tokens: internalRe.t,
      SEMVER_SPEC_VERSION: constants.SEMVER_SPEC_VERSION,
      RELEASE_TYPES: constants.RELEASE_TYPES,
      compareIdentifiers: identifiers.compareIdentifiers,
      rcompareIdentifiers: identifiers.rcompareIdentifiers
    };
  });

  // node_modules/@noble/hashes/utils.js
  /*! noble-hashes - MIT License (c) 2022 Paul Miller (paulmillr.com) */
  function isBytes(a) {
    return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array";
  }
  function abytes(value, length, title = "") {
    const bytes = isBytes(value);
    const len = value?.length;
    const needsLen = length !== undefined;
    if (!bytes || needsLen && len !== length) {
      const prefix = title && `"${title}" `;
      const ofLen = needsLen ? ` of length ${length}` : "";
      const got = bytes ? `length=${len}` : `type=${typeof value}`;
      throw new Error(prefix + "expected Uint8Array" + ofLen + ", got " + got);
    }
    return value;
  }
  function aexists(instance, checkFinished = true) {
    if (instance.destroyed)
      throw new Error("Hash instance has been destroyed");
    if (checkFinished && instance.finished)
      throw new Error("Hash#digest() has already been called");
  }
  function aoutput(out, instance) {
    abytes(out, undefined, "digestInto() output");
    const min = instance.outputLen;
    if (out.length < min) {
      throw new Error('"digestInto() output" expected to be of length >=' + min);
    }
  }
  function clean(...arrays) {
    for (let i = 0;i < arrays.length; i++) {
      arrays[i].fill(0);
    }
  }
  function createView(arr) {
    return new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
  }
  function rotr(word, shift) {
    return word << 32 - shift | word >>> shift;
  }
  function createHasher(hashCons, info = {}) {
    const hashC = (msg, opts) => hashCons(opts).update(msg).digest();
    const tmp = hashCons(undefined);
    hashC.outputLen = tmp.outputLen;
    hashC.blockLen = tmp.blockLen;
    hashC.create = (opts) => hashCons(opts);
    Object.assign(hashC, info);
    return Object.freeze(hashC);
  }
  var oidNist = (suffix) => ({
    oid: Uint8Array.from([6, 9, 96, 134, 72, 1, 101, 3, 4, 2, suffix])
  });

  // node_modules/@noble/hashes/_md.js
  function Chi(a, b, c) {
    return a & b ^ ~a & c;
  }
  function Maj(a, b, c) {
    return a & b ^ a & c ^ b & c;
  }

  class HashMD {
    blockLen;
    outputLen;
    padOffset;
    isLE;
    buffer;
    view;
    finished = false;
    length = 0;
    pos = 0;
    destroyed = false;
    constructor(blockLen, outputLen, padOffset, isLE) {
      this.blockLen = blockLen;
      this.outputLen = outputLen;
      this.padOffset = padOffset;
      this.isLE = isLE;
      this.buffer = new Uint8Array(blockLen);
      this.view = createView(this.buffer);
    }
    update(data) {
      aexists(this);
      abytes(data);
      const { view, buffer, blockLen } = this;
      const len = data.length;
      for (let pos = 0;pos < len; ) {
        const take = Math.min(blockLen - this.pos, len - pos);
        if (take === blockLen) {
          const dataView = createView(data);
          for (;blockLen <= len - pos; pos += blockLen)
            this.process(dataView, pos);
          continue;
        }
        buffer.set(data.subarray(pos, pos + take), this.pos);
        this.pos += take;
        pos += take;
        if (this.pos === blockLen) {
          this.process(view, 0);
          this.pos = 0;
        }
      }
      this.length += data.length;
      this.roundClean();
      return this;
    }
    digestInto(out) {
      aexists(this);
      aoutput(out, this);
      this.finished = true;
      const { buffer, view, blockLen, isLE } = this;
      let { pos } = this;
      buffer[pos++] = 128;
      clean(this.buffer.subarray(pos));
      if (this.padOffset > blockLen - pos) {
        this.process(view, 0);
        pos = 0;
      }
      for (let i = pos;i < blockLen; i++)
        buffer[i] = 0;
      view.setBigUint64(blockLen - 8, BigInt(this.length * 8), isLE);
      this.process(view, 0);
      const oview = createView(out);
      const len = this.outputLen;
      if (len % 4)
        throw new Error("_sha2: outputLen must be aligned to 32bit");
      const outLen = len / 4;
      const state = this.get();
      if (outLen > state.length)
        throw new Error("_sha2: outputLen bigger than state");
      for (let i = 0;i < outLen; i++)
        oview.setUint32(4 * i, state[i], isLE);
    }
    digest() {
      const { buffer, outputLen } = this;
      this.digestInto(buffer);
      const res = buffer.slice(0, outputLen);
      this.destroy();
      return res;
    }
    _cloneInto(to) {
      to ||= new this.constructor;
      to.set(...this.get());
      const { blockLen, buffer, length, finished, destroyed, pos } = this;
      to.destroyed = destroyed;
      to.finished = finished;
      to.length = length;
      to.pos = pos;
      if (length % blockLen)
        to.buffer.set(buffer);
      return to;
    }
    clone() {
      return this._cloneInto();
    }
  }
  var SHA256_IV = /* @__PURE__ */ Uint32Array.from([
    1779033703,
    3144134277,
    1013904242,
    2773480762,
    1359893119,
    2600822924,
    528734635,
    1541459225
  ]);

  // node_modules/@noble/hashes/sha2.js
  var SHA256_K = /* @__PURE__ */ Uint32Array.from([
    1116352408,
    1899447441,
    3049323471,
    3921009573,
    961987163,
    1508970993,
    2453635748,
    2870763221,
    3624381080,
    310598401,
    607225278,
    1426881987,
    1925078388,
    2162078206,
    2614888103,
    3248222580,
    3835390401,
    4022224774,
    264347078,
    604807628,
    770255983,
    1249150122,
    1555081692,
    1996064986,
    2554220882,
    2821834349,
    2952996808,
    3210313671,
    3336571891,
    3584528711,
    113926993,
    338241895,
    666307205,
    773529912,
    1294757372,
    1396182291,
    1695183700,
    1986661051,
    2177026350,
    2456956037,
    2730485921,
    2820302411,
    3259730800,
    3345764771,
    3516065817,
    3600352804,
    4094571909,
    275423344,
    430227734,
    506948616,
    659060556,
    883997877,
    958139571,
    1322822218,
    1537002063,
    1747873779,
    1955562222,
    2024104815,
    2227730452,
    2361852424,
    2428436474,
    2756734187,
    3204031479,
    3329325298
  ]);
  var SHA256_W = /* @__PURE__ */ new Uint32Array(64);

  class SHA2_32B extends HashMD {
    constructor(outputLen) {
      super(64, outputLen, 8, false);
    }
    get() {
      const { A, B, C, D, E, F, G, H } = this;
      return [A, B, C, D, E, F, G, H];
    }
    set(A, B, C, D, E, F, G, H) {
      this.A = A | 0;
      this.B = B | 0;
      this.C = C | 0;
      this.D = D | 0;
      this.E = E | 0;
      this.F = F | 0;
      this.G = G | 0;
      this.H = H | 0;
    }
    process(view, offset) {
      for (let i = 0;i < 16; i++, offset += 4)
        SHA256_W[i] = view.getUint32(offset, false);
      for (let i = 16;i < 64; i++) {
        const W15 = SHA256_W[i - 15];
        const W2 = SHA256_W[i - 2];
        const s0 = rotr(W15, 7) ^ rotr(W15, 18) ^ W15 >>> 3;
        const s1 = rotr(W2, 17) ^ rotr(W2, 19) ^ W2 >>> 10;
        SHA256_W[i] = s1 + SHA256_W[i - 7] + s0 + SHA256_W[i - 16] | 0;
      }
      let { A, B, C, D, E, F, G, H } = this;
      for (let i = 0;i < 64; i++) {
        const sigma1 = rotr(E, 6) ^ rotr(E, 11) ^ rotr(E, 25);
        const T1 = H + sigma1 + Chi(E, F, G) + SHA256_K[i] + SHA256_W[i] | 0;
        const sigma0 = rotr(A, 2) ^ rotr(A, 13) ^ rotr(A, 22);
        const T2 = sigma0 + Maj(A, B, C) | 0;
        H = G;
        G = F;
        F = E;
        E = D + T1 | 0;
        D = C;
        C = B;
        B = A;
        A = T1 + T2 | 0;
      }
      A = A + this.A | 0;
      B = B + this.B | 0;
      C = C + this.C | 0;
      D = D + this.D | 0;
      E = E + this.E | 0;
      F = F + this.F | 0;
      G = G + this.G | 0;
      H = H + this.H | 0;
      this.set(A, B, C, D, E, F, G, H);
    }
    roundClean() {
      clean(SHA256_W);
    }
    destroy() {
      this.set(0, 0, 0, 0, 0, 0, 0, 0);
      clean(this.buffer);
    }
  }

  class _SHA256 extends SHA2_32B {
    A = SHA256_IV[0] | 0;
    B = SHA256_IV[1] | 0;
    C = SHA256_IV[2] | 0;
    D = SHA256_IV[3] | 0;
    E = SHA256_IV[4] | 0;
    F = SHA256_IV[5] | 0;
    G = SHA256_IV[6] | 0;
    H = SHA256_IV[7] | 0;
    constructor() {
      super(32);
    }
  }
  var sha256 = /* @__PURE__ */ createHasher(() => new _SHA256, /* @__PURE__ */ oidNist(1));

  // src/platform-crypto.ts
  function randomUuid(source = crypto) {
    const bytes = source.getRandomValues(new Uint8Array(16));
    bytes[6] = bytes[6] & 15 | 64;
    bytes[8] = bytes[8] & 63 | 128;
    const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }
  async function sha2562(bytes) {
    return Array.from(sha256(bytes), (byte) => byte.toString(16).padStart(2, "0")).join("");
  }

  // src/core/errors.ts
  var errorCodes = [
    "VIEWER_LIMIT_EXCEEDED",
    "SERVICE_DISABLED",
    "SETTINGS_FAILED",
    "AUTHORIZATION_CANCELLED",
    "AUTHORIZATION_TIMEOUT",
    "AUTHORIZATION_FAILED",
    "SERVICE_RESTARTING",
    "IDENTITY_FAILED",
    "IDENTITY_CONFLICT",
    "STALE_IDENTITY",
    "ENTITY_RENAME_PENDING",
    "ENTITY_RENAME_UNCONFIRMED",
    "ENTITY_DELETE_PENDING",
    "ENTITY_DELETE_UNCONFIRMED",
    "UUID_SAVE_FAILED",
    "UUID_REGISTRATION_FAILED",
    "UUID_SYNC_FAILED",
    "NOT_INITIALIZED",
    "DATABASE_NOT_INITIALIZED",
    "INSTANCE_DISABLED",
    "SQL_FAILED",
    "ROLLBACK_FAILED",
    "SAVE_FAILED",
    "LOAD_FAILED",
    "PERMISSION_REQUIRED",
    "INVALID_REQUEST",
    "INTERNAL_ERROR",
    "UNSUPPORTED_ENVIRONMENT",
    "PROTOCOL_MISMATCH",
    "ALREADY_INITIALIZED",
    "CONNECTION_FAILED",
    "RESULT_UNCONFIRMED",
    "STALE_CONFIGURATION",
    "CONFIG_CHANGING",
    "CONFIG_FAILED"
  ];
  function serviceData(error, depth = 0) {
    try {
      if (depth > 4)
        return;
      if (!error || typeof error !== "object")
        return;
      const source = Object.getOwnPropertyDescriptor(error, "data")?.value;
      if (!source || typeof source !== "object" || Array.isArray(source))
        return;
      const value = (key) => {
        const property = Object.getOwnPropertyDescriptor(source, key);
        if (property && !("value" in property))
          throw new Error("Error data must contain values.");
        return property?.value;
      };
      const code = value("code"), message = value("message");
      if (!errorCodes.includes(code) || typeof message !== "string")
        return;
      const result = { code, message, resultState: "not-applied", retryable: false };
      for (const key of [
        "failureKind",
        "executionState",
        "resultState",
        "resultKind",
        "identityStage",
        "identitySaved",
        "renameStage",
        "deleteStage",
        "databaseScope",
        "initializationStage",
        "databasePersisted",
        "businessResult",
        "retryable",
        "operationId",
        "disabledReason"
      ]) {
        const item = value(key);
        if (item === undefined)
          continue;
        const valid = key === "failureKind" ? ["request-rejected", "sql-rejected", "precondition-rejected", "service"].includes(item) : key === "executionState" ? ["not-started", "rolled-back", "committed", "unknown"].includes(item) : key === "resultState" ? ["not-applied", "unconfirmed"].includes(item) : key === "resultKind" ? ["database", "identity"].includes(item) : key === "identityStage" ? ["save", "register", "sync"].includes(item) : key === "renameStage" || key === "deleteStage" ? ["pending", "applied", "unconfirmed", "conflict"].includes(item) : key === "identitySaved" || key === "databasePersisted" ? item === true : key === "databaseScope" ? ["char", "chat"].includes(item) : key === "initializationStage" ? ["root-prepare", "target-save", "root-finalize"].includes(item) : key === "businessResult" ? ["not-started", "not-saved", "saved", "unknown"].includes(item) : key === "retryable" ? typeof item === "boolean" : key === "disabledReason" ? item === "not-configured" : typeof item === "string";
        if (!valid)
          return;
        Object.assign(result, { [key]: item });
      }
      for (const key of ["sqlError", "rollbackError", "recoveryError", "saveError", "causeError"]) {
        const item = value(key);
        if (item === undefined)
          continue;
        if (!item || typeof item !== "object" || Array.isArray(item))
          return;
        const fields = Object.getOwnPropertyDescriptors(item);
        if (!fields.message || !("value" in fields.message) || typeof fields.message.value !== "string")
          return;
        const projected = { message: fields.message.value };
        for (const field of ["name", "code"]) {
          const property = fields[field];
          if (!property)
            continue;
          if (!("value" in property))
            return;
          if (property.value === undefined)
            continue;
          if (typeof property.value !== "string" || field === "code" && !errorCodes.includes(property.value))
            return;
          Object.assign(projected, { [field]: property.value });
        }
        const nativeCode = fields.sqliteCode;
        if (nativeCode) {
          if (!("value" in nativeCode) || !Number.isInteger(nativeCode.value))
            return;
          projected.sqliteCode = nativeCode.value;
        }
        result[key] = projected;
      }
      return result;
    } catch {
      return;
    }
  }
  function detail(error) {
    const data = serviceData(error);
    try {
      if (error && typeof error === "object") {
        const message = data?.message ?? Reflect.get(error, "message"), name = Reflect.get(error, "name");
        const nativeCode = Object.getOwnPropertyDescriptor(error, "sqliteCode")?.value;
        if (typeof message === "string")
          return {
            message,
            ...typeof name === "string" ? { name } : {},
            ...data ? { code: data.code } : {},
            ...Number.isInteger(nativeCode) ? { sqliteCode: nativeCode } : {}
          };
      }
      return { message: String(error) };
    } catch {
      return { message: "无法读取原异常内容。" };
    }
  }

  class ServiceError extends Error {
    data;
    constructor(data) {
      super(data.message);
      this.data = data;
      this.name = "ServiceError";
      this.data = { resultState: "not-applied", retryable: false, ...data };
    }
  }
  function errorData(error) {
    return serviceData(error) ?? {
      code: "INTERNAL_ERROR",
      failureKind: "service",
      message: `服务内部发生未预期错误，无法确认本次操作结果：${detail(error).message}`,
      causeError: detail(error),
      resultState: "unconfirmed",
      retryable: false
    };
  }
  function identityFailure(message, resultState = "not-applied", cause) {
    return new ServiceError({
      code: "IDENTITY_FAILED",
      message,
      resultKind: "identity",
      resultState,
      ...cause === undefined ? {} : { causeError: detail(cause) }
    });
  }
  function fileRetryable(error) {
    const data = serviceData(error);
    if (data)
      return data.retryable === true;
    return ![
      "NotAllowedError",
      "SecurityError",
      "QuotaExceededError",
      "NotFoundError",
      "TypeMismatchError",
      "InvalidModificationError"
    ].includes(detail(error).name ?? "");
  }

  // src/protocol.ts
  var PROTOCOL_VERSION = 27;
  var BUILD_ID = "54a98885-c6ce-4dff-8682-fd2a9c7316d5";
  var extensionEntryPath = undefined;
  var EXTENSION_NAME = extensionEntryPath?.match(/^\/scripts\/extensions\/third-party\/([^/]+)\/src\/index\.js$/)?.[1] ?? "st-sqlite-helper";
  var EXTENSION_TEMPLATE_PATH = `third-party/${EXTENSION_NAME}/src`;
  var EXTENSION_PATH = `/scripts/extensions/${EXTENSION_TEMPLATE_PATH}/`;
  var WORKER_URL = `${EXTENSION_PATH}sqlite-worker.js`;
  var DEDICATED_WORKER_URL = `${EXTENSION_PATH}sqlite-dedicated-worker.js`;
  var EXECUTION_PROBE_URL = `${EXTENSION_PATH}sqlite-probe.js`;
  var isUuid = (value) => typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
  var bindingKey = (b) => JSON.stringify([b.storageId, b.configGeneration, b.scope ?? "global", b.charDbId ?? null, b.chatDbId ?? null]);
  var identityBindingKey = (b) => JSON.stringify([
    bindingKey(b),
    b.characterEntity ?? null,
    b.chatEntity ?? null,
    b.identityGeneration ?? null,
    b.chatIdentityGeneration ?? null,
    b.characterReferenceId ?? null,
    b.chatReferenceId ?? null
  ]);
  function isWriteAction(action) {
    return ["transaction", "checked-transaction", "update", "exec", "runSql", "batch"].includes(action.type);
  }

  // src/worker/entity-coordinator.ts
  var roleKey = (entity) => `role:${JSON.stringify(entity)}`;
  var chatKey = (entity) => `chat:${entity}`;
  var domain = (b) => JSON.stringify([b.storageId, b.configGeneration]);
  var validEntity = (entity) => typeof entity === "string" && !!entity && entity.length <= 4096;
  function fail(code, message) {
    throw new ServiceError({ code, message, resultKind: "identity", resultState: "not-applied", retryable: false });
  }
  function reference(value) {
    if (value && (!(value.id === null || isUuid(value.id)) || !Number.isSafeInteger(value.generation) || value.generation < 1 || typeof value.confirmed !== "boolean" || !["generated", "legacy"].includes(value.origin))) {
      throw new ServiceError({ code: "LOAD_FAILED", message: "root 文件引用记录无效，拒绝补造身份。" });
    }
    return value;
  }

  class EntityCoordinator {
    access;
    checkRename;
    checkTarget;
    readAccess;
    confirmed = new Map;
    currentCoordinates = new Map;
    tail = Promise.resolve();
    constructor(access, checkRename = () => {}, checkTarget = () => {}, readAccess = access) {
      this.access = access;
      this.checkRename = checkRename;
      this.checkTarget = checkTarget;
      this.readAccess = readAccess;
    }
    serialize(task) {
      const work = this.tail.then(task);
      this.tail = work.catch(() => {});
      return work;
    }
    cacheKey(binding, entity, chat = false) {
      return JSON.stringify([
        domain(binding),
        chat ? chatKey(entity) : roleKey(entity),
        binding.charDbId ?? null,
        chat ? binding.chatDbId ?? null : null,
        chat ? binding.chatIdentityGeneration ?? null : binding.identityGeneration ?? null
      ]);
    }
    propose(binding, entity, id) {
      return this.serialize(() => this.access(binding, async (records) => {
        this.checkRename(binding, entity);
        this.checkRename(binding, binding.characterEntity);
        this.checkTarget(binding, id, true);
        const key = chatKey(entity), old = reference(await records.get(key));
        if (old?.id && old.id !== id)
          fail("IDENTITY_CONFLICT", "该文件已确认或提议另一 UUID，不能另建身份。");
        const next = old?.id === id ? old : {
          id,
          generation: (old?.generation ?? 0) + 1,
          confirmed: false,
          origin: "generated",
          ...old?.referenceId ? { referenceId: old.referenceId } : {},
          parent: binding.charDbId
        };
        await records.putChatProposal({ ...binding, scope: "chat", chatDbId: id }, entity, next, old ?? null);
      }));
    }
    prepareRole(binding, entity, ensureTarget, create = true) {
      const key = roleKey(entity);
      return this.serialize(async () => {
        const proposal = await this.access(binding, async (records) => {
          if (!validEntity(entity))
            fail("IDENTITY_CONFLICT", "角色身份准备需要有效的角色文件名。");
          this.checkRename(binding, entity);
          const old = reference(await records.get(key));
          if (old?.id && (old.confirmed || old.origin === "generated")) {
            this.checkTarget(binding, old.id, false);
            return old;
          }
          if (old?.id)
            throw new ServiceError({
              code: "LOAD_FAILED",
              message: "角色管理记录未确认且不是生成编号，拒绝猜测身份。"
            });
          if (!create)
            return;
          const id = randomUuid();
          this.checkTarget(binding, id, false);
          const next = {
            id,
            generation: (old?.generation ?? 0) + 1,
            confirmed: false,
            origin: "generated",
            ...old?.referenceId ? { referenceId: old.referenceId } : {}
          };
          await records.put(key, next, old ?? null);
          return next;
        });
        if (!proposal)
          return;
        if (proposal.origin === "generated")
          await ensureTarget(proposal.id);
        return this.access(binding, async (records) => {
          this.checkRename(binding, entity);
          const old = reference(await records.get(key));
          if (!old || old.id !== proposal.id)
            fail("STALE_IDENTITY", "角色编号登记在准备期间已改变，未确认身份。");
          this.checkTarget(binding, old.id, false);
          if (!old.confirmed)
            await records.put(key, { ...old, confirmed: true }, old);
          const saved = reference(await records.get(key));
          if (!saved?.confirmed || !saved.id || !saved.referenceId)
            throw new ServiceError({ code: "LOAD_FAILED", message: "角色编号登记后读回不一致。" });
          return saved;
        });
      });
    }
    lookupRole(binding, entity) {
      return this.serialize(() => this.readAccess(binding, async (records) => {
        if (!validEntity(entity))
          fail("IDENTITY_CONFLICT", "角色身份查找需要有效的角色文件名。");
        this.checkRename(binding, entity);
        if (!await records.hasManagement())
          return;
        const value = reference(await records.get(roleKey(entity)));
        return value?.confirmed && value.id && value.referenceId ? value : undefined;
      }));
    }
    generation(binding, entity, chat = false) {
      return this.access(binding, async (records) => {
        const value = reference(await records.get(chat ? chatKey(entity) : roleKey(entity)));
        if (!value)
          fail("STALE_IDENTITY", "身份提案尚未保存。");
        return value.generation;
      });
    }
    credential(binding, entity, chat = false) {
      return this.access(binding, async (records) => {
        const fixed = chat ? binding.scope === "chat" : ["char", "chat"].includes(binding.scope ?? "");
        const value = reference(fixed ? (await records.readReference(entity, chat, chat ? binding.chatIdentityGeneration : binding.identityGeneration, chat ? binding.chatDbId : binding.charDbId, chat ? binding.chatReferenceId : binding.characterReferenceId))?.reference : await records.get(chat ? chatKey(entity) : roleKey(entity)));
        if (!value?.referenceId)
          fail("STALE_IDENTITY", "原管理记录已经不存在。");
        return { generation: value.generation, referenceId: value.referenceId };
      });
    }
    forgetReference(binding, referenceId, chat) {
      for (const [key, value] of this.confirmed)
        if (JSON.parse(key)[0] === domain(binding) && value.referenceId === referenceId && String(JSON.parse(key)[1]).startsWith("chat:") === chat) {
          this.confirmed.delete(key);
          this.currentCoordinates.delete(key);
        }
    }
    candidate(binding, entity) {
      return this.access(binding, async (records) => {
        this.checkRename(binding, entity);
        this.checkRename(binding, binding.characterEntity);
        const value = reference(await records.get(chatKey(entity)));
        return value?.origin === "generated" && !value.confirmed && value.id ? value.id : undefined;
      });
    }
    confirm(binding, entity, id, chat = false, expectedGeneration) {
      return this.serialize(() => this.access(binding, async (records) => {
        if (!validEntity(entity) || !isUuid(id))
          fail("IDENTITY_CONFLICT", "身份确认需要有效的文件坐标和 UUID。");
        this.checkRename(binding, entity);
        this.checkRename(binding, binding.characterEntity);
        this.checkTarget(binding, id, chat);
        if (expectedGeneration !== undefined) {
          const resolved = await records.readReference(entity, chat, expectedGeneration, id, chat ? binding.chatReferenceId : binding.characterReferenceId);
          const restored = reference(resolved?.reference);
          this.checkRename(binding, resolved?.currentEntity ?? entity);
          if (!restored?.confirmed || restored.id !== id || chat && restored.parent !== binding.charDbId)
            fail("STALE_IDENTITY", "原文件记录或代次已失效，未重新建立旧文件引用。");
          this.confirmed.set(this.cacheKey(binding, entity, chat), restored);
          this.currentCoordinates.set(this.cacheKey(binding, entity, chat), resolved.currentEntity);
          return restored.generation;
        }
        if (!chat)
          fail("STALE_IDENTITY", "角色编号只能由管理库登记确认，未按外部编号建立身份。");
        const key = chatKey(entity), old = reference(await records.get(key));
        if (old?.id && old.id !== id)
          fail("STALE_IDENTITY", "文件引用与读回 UUID 不一致，不能重定向原代理。");
        if (old?.parent !== undefined && old.parent !== binding.charDbId)
          fail("IDENTITY_CONFLICT", "聊天引用的所属角色 UUID 不一致。");
        const next = {
          id,
          generation: old?.generation ?? 1,
          confirmed: true,
          origin: old?.origin ?? "legacy",
          ...old?.referenceId ? { referenceId: old.referenceId } : {},
          parent: binding.charDbId
        };
        await records.put(key, next, old ?? null);
        this.confirmed.set(this.cacheKey(binding, entity, chat), next);
        return next.generation;
      }));
    }
    confirmReadOnly(binding, entity, id, chat = false) {
      return this.serialize(() => this.readAccess(binding, async (records) => {
        this.checkRename(binding, entity);
        this.checkRename(binding, binding.characterEntity);
        this.checkTarget(binding, id, chat);
        const old = reference(await records.get(chat ? chatKey(entity) : roleKey(entity)));
        if (!old?.confirmed || old.id !== id || chat && old.parent !== binding.charDbId || (chat ? binding.chatReferenceId : binding.characterReferenceId) !== undefined && old.referenceId !== (chat ? binding.chatReferenceId : binding.characterReferenceId))
          fail("STALE_IDENTITY", "没有与当前 UUID 匹配的已有确认记录；查看不会补写身份。");
        this.confirmed.set(this.cacheKey(binding, entity, chat), old);
        this.currentCoordinates.set(this.cacheKey(binding, entity, chat), entity);
        return old.generation;
      }));
    }
    verify(binding, allowPendingRename = false, readOnly = false) {
      if (!["char", "chat"].includes(binding.scope ?? ""))
        return Promise.resolve();
      return this.serialize(() => (readOnly ? this.readAccess : this.access)(binding, async (records) => {
        const entity = binding.characterEntity;
        if (!validEntity(entity))
          fail("STALE_IDENTITY", "数据库请求缺少已确认的角色文件坐标。");
        if (!allowPendingRename) {
          this.checkRename(binding, entity);
          this.checkRename(binding, binding.chatEntity);
        }
        const resolvedRole = await records.readReference(entity, false, binding.identityGeneration, binding.charDbId, binding.characterReferenceId);
        if (!allowPendingRename)
          this.checkRename(binding, resolvedRole?.currentEntity);
        const role = reference(resolvedRole?.reference);
        if (!role?.confirmed || role.id !== binding.charDbId || role.generation !== binding.identityGeneration || binding.characterReferenceId !== undefined && role.referenceId !== binding.characterReferenceId)
          fail("STALE_IDENTITY", "角色文件的访问确认已失效，本次 SQL 未执行。");
        this.confirmed.set(this.cacheKey(binding, entity), role);
        this.currentCoordinates.set(this.cacheKey(binding, entity), resolvedRole.currentEntity);
        if (binding.scope === "chat") {
          if (!validEntity(binding.chatEntity))
            fail("STALE_IDENTITY", "数据库请求缺少已确认的聊天文件坐标。");
          const resolvedChat = await records.readReference(binding.chatEntity, true, binding.chatIdentityGeneration, binding.chatDbId, binding.chatReferenceId);
          if (!allowPendingRename)
            this.checkRename(binding, resolvedChat?.currentEntity);
          const chat = reference(resolvedChat?.reference);
          if (!chat?.confirmed || chat.id !== binding.chatDbId || chat.parent !== binding.charDbId || chat.generation !== binding.chatIdentityGeneration || binding.chatReferenceId !== undefined && chat.referenceId !== binding.chatReferenceId)
            fail("STALE_IDENTITY", "聊天文件的访问确认已失效，本次 SQL 未执行。");
          this.confirmed.set(this.cacheKey(binding, binding.chatEntity, true), chat);
          this.currentCoordinates.set(this.cacheKey(binding, binding.chatEntity, true), resolvedChat.currentEntity);
        }
      }));
    }
    assertCached(binding) {
      if (!["char", "chat"].includes(binding.scope ?? ""))
        return;
      if (!validEntity(binding.characterEntity))
        fail("STALE_IDENTITY", "角色文件坐标缺失。");
      this.checkRename(binding, binding.characterEntity);
      this.checkRename(binding, binding.chatEntity);
      this.checkRename(binding, this.currentCoordinates.get(this.cacheKey(binding, binding.characterEntity)));
      if (binding.chatEntity)
        this.checkRename(binding, this.currentCoordinates.get(this.cacheKey(binding, binding.chatEntity, true)));
      const role = this.confirmed.get(this.cacheKey(binding, binding.characterEntity));
      if (!role?.confirmed || role.id !== binding.charDbId || role.generation !== binding.identityGeneration || binding.characterReferenceId !== undefined && role.referenceId !== binding.characterReferenceId)
        fail("STALE_IDENTITY", "角色访问确认已失效。");
      if (binding.scope === "chat") {
        const chat = binding.chatEntity && this.confirmed.get(this.cacheKey(binding, binding.chatEntity, true));
        if (!chat || chat.id !== binding.chatDbId || chat.parent !== binding.charDbId || chat.generation !== binding.chatIdentityGeneration || binding.chatReferenceId !== undefined && chat.referenceId !== binding.chatReferenceId)
          fail("STALE_IDENTITY", "聊天访问确认已失效。");
      }
    }
  }

  // src/worker/entity-schema.ts
  var damaged = (message) => new ServiceError({ code: "LOAD_FAILED", message });
  function coordinate(entity, chat) {
    if (!chat) {
      if (!entity || entity.length > 4096 || entity.includes("\x00"))
        throw damaged("角色文件坐标无效。");
      return { chat: false, avatar: entity };
    }
    let value;
    try {
      value = JSON.parse(entity);
    } catch {
      throw damaged("聊天文件坐标不是有效的角色和文件名。");
    }
    if (!Array.isArray(value) || value.length !== 2 || value.some((v) => typeof v !== "string" || !v || v.length > 4096 || v.includes("\x00")))
      throw damaged("聊天文件坐标不是有效的角色和文件名。");
    return { chat: true, avatar: value[0], file: value[1] };
  }
  function parseEntityKey(key) {
    if (key.startsWith("chat:"))
      return coordinate(key.slice(5), true);
    if (key.startsWith("role:")) {
      let avatar;
      try {
        avatar = JSON.parse(key.slice(5));
      } catch {
        throw damaged("角色记录键无效。");
      }
      if (typeof avatar !== "string")
        throw damaged("角色记录键无效。");
      return coordinate(avatar, false);
    }
  }
  function validateReference(value, chat) {
    const r = value;
    if (!r || typeof r !== "object" || Array.isArray(r) || !(r.id === null || isUuid(r.id)) || !Number.isSafeInteger(r.generation) || r.generation < 1 || typeof r.confirmed !== "boolean" || !["generated", "legacy"].includes(r.origin) || chat && !isUuid(r.parent) || !chat && r.parent !== undefined || r.referenceId !== undefined && (!Number.isSafeInteger(r.referenceId) || r.referenceId < 1) || Object.keys(r).some((k) => !["id", "generation", "confirmed", "origin", "parent", "referenceId"].includes(k)))
      throw damaged("root 角色或聊天引用字段无效，拒绝补造身份。");
    return r;
  }
  var META = "__stsh_meta";
  var TARGETS = "__stsh_targets";
  var ROLES = "__stsh_roles";
  var CHATS = "__stsh_chats";
  var ACTIVE_ROLES = "__stsh_active_roles";
  var ACTIVE_CHATS = "__stsh_active_chats";
  var SCHEMA6 = [
    `CREATE TABLE ${META} (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL)`,
    `CREATE TABLE ${TARGETS} (scope TEXT NOT NULL CHECK(scope IN ('char','chat')), char_dbid TEXT NOT NULL, chat_dbid TEXT NOT NULL, origin TEXT NOT NULL CHECK(origin IN ('generated','legacy')), state TEXT NOT NULL CHECK(state IN ('never','creating','ready')), PRIMARY KEY(scope,char_dbid,chat_dbid), CHECK((scope='char' AND chat_dbid='') OR (scope='chat' AND chat_dbid<>'')))`,
    `CREATE TABLE ${ROLES} (role_id INTEGER PRIMARY KEY AUTOINCREMENT, avatar_name TEXT NOT NULL, char_dbid TEXT, generation INTEGER NOT NULL CHECK(generation>=0), confirmed INTEGER NOT NULL CHECK(confirmed IN (0,1)), origin TEXT NOT NULL CHECK(origin IN ('generated','legacy')), state TEXT NOT NULL DEFAULT 'active' CHECK(state IN ('active','deleted')), CHECK(generation>0 OR (char_dbid IS NULL AND confirmed=0)))`,
    `CREATE TABLE ${CHATS} (chat_id INTEGER PRIMARY KEY AUTOINCREMENT, role_id INTEGER NOT NULL REFERENCES ${ROLES}(role_id), file_name TEXT NOT NULL, chat_dbid TEXT, parent_char_dbid TEXT NOT NULL, generation INTEGER NOT NULL CHECK(generation>0), confirmed INTEGER NOT NULL CHECK(confirmed IN (0,1)), origin TEXT NOT NULL CHECK(origin IN ('generated','legacy')), state TEXT NOT NULL DEFAULT 'active' CHECK(state IN ('active','retained','deleted')))`,
    `CREATE INDEX __stsh_roles_uuid ON ${ROLES}(char_dbid)`,
    `CREATE INDEX __stsh_chats_uuid ON ${CHATS}(chat_dbid)`,
    `CREATE UNIQUE INDEX __stsh_active_role_name ON ${ROLES}(avatar_name) WHERE state='active'`,
    `CREATE UNIQUE INDEX __stsh_active_chat_name ON ${CHATS}(role_id,file_name) WHERE state<>'deleted'`,
    `CREATE INDEX __stsh_chat_file ON ${CHATS}(file_name,state)`,
    `CREATE INDEX __stsh_chat_target ON ${CHATS}(parent_char_dbid,chat_dbid,state)`,
    `CREATE VIEW ${ACTIVE_ROLES} AS SELECT role_id,avatar_name,char_dbid,generation,confirmed,origin FROM ${ROLES} WHERE state='active'`,
    `CREATE VIEW ${ACTIVE_CHATS} AS SELECT c.chat_id,c.role_id,c.file_name,c.chat_dbid,c.parent_char_dbid,c.generation,c.confirmed,c.origin FROM ${CHATS} c JOIN ${ROLES} r USING(role_id) WHERE c.state='active' AND r.state='active'`
  ];
  var activeSql = (sql) => sql.replaceAll(ROLES, ACTIVE_ROLES).replaceAll(CHATS, ACTIVE_CHATS);
  async function readEntityRows(root, sql, binds) {
    try {
      return (await root.query({ sql: activeSql(sql), binds })).rows;
    } catch (error) {
      if (errorData(error).code !== "SQL_FAILED")
        throw error;
      throw damaged(`root 实体记录无法读取：${detail(error).message}`);
    }
  }
  function roleRow(row) {
    if (row[4] !== 0 && row[4] !== 1)
      throw damaged("角色 confirmed 字段无效。");
    return validateReference({ referenceId: row[0], id: row[2], generation: row[3], confirmed: row[4] === 1, origin: row[5] }, false);
  }
  function chatRow(row) {
    if (row[6] !== 0 && row[6] !== 1)
      throw damaged("聊天 confirmed 字段无效。");
    return validateReference({ referenceId: row[0], id: row[3], parent: row[4], generation: row[5], confirmed: row[6] === 1, origin: row[7] }, true);
  }
  async function currentReference(root, c) {
    const rows = c.chat ? await readEntityRows(root, `SELECT c.chat_id,r.avatar_name,c.file_name,c.chat_dbid,c.parent_char_dbid,c.generation,c.confirmed,c.origin FROM ${CHATS} c JOIN ${ROLES} r USING(role_id) WHERE r.avatar_name=? AND c.file_name=?`, [c.avatar, c.file]) : await readEntityRows(root, `SELECT role_id,avatar_name,char_dbid,generation,confirmed,origin FROM ${ROLES} WHERE avatar_name=? AND generation>0`, [c.avatar]);
    if (rows.length > 1)
      throw damaged("root 当前文件坐标不唯一。");
    return rows[0] ? c.chat ? chatRow(rows[0]) : roleRow(rows[0]) : undefined;
  }
  var entityConflict = (message) => new ServiceError({ code: "IDENTITY_CONFLICT", message });
  function rawGuard(sql, binds) {
    return { sql: `INSERT INTO ${META}(key,value) SELECT NULL,'null' WHERE NOT EXISTS(${sql})`, binds };
  }
  function guard(sql, binds) {
    return rawGuard(activeSql(sql), binds);
  }
  function referenceGuard(c, r) {
    return guard(c.chat ? `SELECT 1 FROM ${CHATS} c JOIN ${ROLES} r USING(role_id) WHERE c.chat_id=? AND c.chat_dbid IS ? AND c.parent_char_dbid=? AND c.generation=? AND c.confirmed=? AND c.origin=?` : `SELECT 1 FROM ${ROLES} WHERE role_id=? AND char_dbid IS ? AND generation=? AND confirmed=? AND origin=?`, c.chat ? [r.referenceId, r.id, r.parent, r.generation, Number(r.confirmed), r.origin] : [r.referenceId, r.id, r.generation, Number(r.confirmed), r.origin]);
  }
  async function saveEntities(root, commands) {
    try {
      await root.transaction(commands, undefined, { management: true });
    } catch (error) {
      const data = errorData(error);
      if (data.code === "SQL_FAILED" && (data.sqlError?.message?.includes(`${META}.key`) || data.sqlError?.message?.startsWith("UNIQUE constraint failed:")))
        throw entityConflict("对象记录已改变，拒绝覆盖当前事实。");
      throw error;
    }
  }
  async function protectionReferences(root, target) {
    const chat = target.scope === "chat";
    const rows = (await root.query({
      sql: chat ? `SELECT SUM(CASE WHEN state='active' AND confirmed=1 THEN 1 ELSE 0 END),SUM(CASE WHEN state='retained' THEN 1 ELSE 0 END),SUM(CASE WHEN state<>'deleted' AND confirmed=0 THEN 1 ELSE 0 END) FROM ${CHATS} WHERE parent_char_dbid=? AND chat_dbid=?` : `SELECT SUM(CASE WHEN state='active' AND confirmed=1 THEN 1 ELSE 0 END),0,SUM(CASE WHEN state='active' AND confirmed=0 THEN 1 ELSE 0 END) FROM ${ROLES} WHERE char_dbid=?`,
      binds: chat ? [target.charDbId, target.chatDbId] : [target.charDbId]
    })).rows[0];
    return { active: Number(rows?.[0] ?? 0), retained: Number(rows?.[1] ?? 0), unconfirmed: Number(rows?.[2] ?? 0) };
  }
  var normalize = (s) => s.replace(/\s+/g, "").replaceAll('"', "").toLowerCase();
  var sameDefinition = (stored, expected) => {
    const strip = (s) => normalize(s).replace(/^createtableifnotexists/, "createtable");
    return strip(stored) === strip(expected);
  };
  var objectType = (sql) => sql.includes(" VIEW ") ? "view" : sql.includes(" INDEX ") ? "index" : "table";
  async function schemaDifferences(root) {
    const result = [];
    let metaPresent = false;
    for (const sql of SCHEMA6) {
      const name = sql.split(" ")[sql.startsWith("CREATE UNIQUE") ? 3 : 2];
      const rows = (await root.query({ sql: "SELECT sql FROM sqlite_master WHERE name=?", binds: [name] })).rows;
      const valid = rows.length === 1 && normalize(String(rows[0][0])) === normalize(sql);
      if (name === META)
        metaPresent = valid;
      if (!valid)
        result.push({
          kind: "object",
          name,
          type: objectType(sql),
          message: `管理对象 ${name} 结构无效。`,
          detail: rows.length ? `${name} 的定义与当前版本不同。` : `缺少 ${name}。`
        });
    }
    if (metaPresent) {
      const version = (await root.query({ sql: `SELECT value FROM ${META} WHERE key='schema_version'` })).rows;
      if (version.length !== 1 || version[0][0] !== "6")
        result.push({
          kind: "version",
          message: "管理结构版本无效。",
          detail: `结构版本为 ${version.length === 1 ? String(version[0][0]) : "空"}，应为 6。`
        });
    }
    if ((await root.query({ sql: "SELECT * FROM pragma_foreign_key_check" })).rows.length)
      result.push({
        kind: "foreign-key",
        message: "管理记录外键关系无效。",
        detail: "有聊天记录指向不存在的角色记录。"
      });
    return result;
  }
  async function inspectSchema6(root) {
    const names = (await root.query({
      sql: "SELECT name FROM sqlite_master WHERE name GLOB '__stsh_*' OR name GLOB '__st_sle_helper_*'"
    })).rows.map((row) => String(row[0]));
    if (!names.length)
      return { state: "uninitialized", differences: [] };
    const differences = names.filter((name) => name.startsWith("__st_sle_helper_")).map((name) => ({
      kind: "legacy",
      name,
      message: "数据库包含已停止支持的旧管理结构，请使用当前结构的数据文件。",
      detail: `存在已停止支持的旧管理对象 ${name}。`
    }));
    differences.push(...await schemaDifferences(root));
    return { state: differences.length ? "invalid" : "valid", differences };
  }
  async function assertSchema6(root) {
    const first = (await schemaDifferences(root))[0];
    if (first)
      throw damaged(first.message);
  }

  // src/worker/entity-renames.ts
  var domain2 = (b) => JSON.stringify([b.storageId, b.configGeneration]);

  class EntityRenames {
    access;
    tasks = new Map;
    running = 0;
    tail = Promise.resolve();
    constructor(access) {
      this.access = access;
    }
    serialize(work) {
      this.running++;
      const next = this.tail.then(work).finally(() => {
        this.running--;
      });
      this.tail = next.catch(() => {});
      return next;
    }
    assertEntity(b, entity) {
      if (!entity)
        return;
      for (const [key, task] of this.tasks) {
        if (!key.startsWith(`${domain2(b)}:`))
          continue;
        const affected = [task.oldEntity, task.newEntity].some((name) => name === entity || task.kind === "char" && (() => {
          try {
            return coordinate(entity, true).avatar === name;
          } catch {
            return false;
          }
        })());
        if (affected)
          throw new ServiceError({
            code: task.stage === "pending" ? "ENTITY_RENAME_PENDING" : "ENTITY_RENAME_UNCONFIRMED",
            resultKind: "identity",
            message: "该文件的改名尚未核对，请重新读回酒馆文件；本次 SQL 未执行。"
          });
      }
    }
    assertSettled() {
      if (this.running)
        throw new ServiceError({ code: "ENTITY_RENAME_PENDING", message: "改名登记仍在执行，请等待完成。" });
    }
    begin(kind, oldEntity, newEntity, b) {
      if (!["char", "chat"].includes(kind) || oldEntity === newEntity)
        return Promise.reject(new ServiceError({ code: "INVALID_REQUEST", message: "改名事件需要明确的新旧文件名。" }));
      coordinate(oldEntity, kind === "chat");
      coordinate(newEntity, kind === "chat");
      if (kind === "chat" && coordinate(oldEntity, true).avatar !== coordinate(newEntity, true).avatar)
        return Promise.reject(new ServiceError({ code: "IDENTITY_CONFLICT", message: "聊天改名不能改变所属角色。" }));
      if (!b)
        return Promise.reject(new ServiceError({ code: "ENTITY_RENAME_PENDING", message: "请先授权原数据库目录，再核对改名。" }));
      return this.serialize(() => this.access(b, async (records) => {
        const key = `${domain2(b)}:${JSON.stringify([kind, oldEntity, newEntity])}`;
        const existing = this.tasks.get(key);
        if (existing)
          return structuredClone(existing);
        const info = await records.referenceInfo(oldEntity, kind === "chat");
        if (!info && await records.referenceInfo(newEntity, kind === "chat"))
          return { taskId: randomUuid(), kind, oldEntity, newEntity, stage: "applied" };
        const ticket = {
          taskId: randomUuid(),
          kind,
          oldEntity,
          newEntity,
          stage: "pending",
          ...info ? { expected: info.reference } : { unobserved: true }
        };
        this.tasks.set(key, ticket);
        return structuredClone(ticket);
      }));
    }
    settle(ticket, observedId, confirmed, b, hasExternalWork) {
      return this.serialize(() => this.access(b, async (records) => {
        const key = `${domain2(b)}:${JSON.stringify([ticket.kind, ticket.oldEntity, ticket.newEntity])}`;
        const row = this.tasks.get(key);
        if (!row || row.taskId !== ticket.taskId || row.oldEntity !== ticket.checkedOldEntity || row.newEntity !== ticket.checkedNewEntity || JSON.stringify(row.expected) !== JSON.stringify(ticket.expected))
          throw new ServiceError({ code: "STALE_IDENTITY", message: "原改名核对已失效，请重新读回。" });
        if (!confirmed || hasExternalWork() || row.kind === "chat" && row.expected?.id && !row.expected.confirmed) {
          row.stage = "unconfirmed";
          throw new ServiceError({
            code: "ENTITY_RENAME_UNCONFIRMED",
            message: "酒馆文件或原身份尚未确认，未修改数据库引用。"
          });
        }
        if (row.kind === "char") {
          if (row.expected)
            await records.renameRole(row.oldEntity, row.newEntity, row.expected);
        } else {
          const parent = (await records.referenceInfo(coordinate(row.newEntity, true).avatar, false))?.reference;
          if (row.expected) {
            if (!parent?.id || parent.id !== row.expected.parent || row.expected.id !== observedId)
              throw new ServiceError({
                code: "IDENTITY_CONFLICT",
                message: "改名聊天的数据库编号或所属角色登记与原对象不同，未修改引用。"
              });
            await records.renameChat(row.oldEntity, row.newEntity, row.expected);
          } else if (parent?.id && parent.confirmed)
            await records.confirmUnknownRename(row.newEntity, true, {
              id: observedId,
              generation: 1,
              confirmed: observedId !== null,
              origin: "legacy",
              parent: parent.id
            });
        }
        this.tasks.delete(key);
        return { ...row, stage: "applied" };
      }));
    }
  }

  // src/database-path.ts
  var GLOBAL_DATABASE = "global.sqlite";
  var CHARACTERS_DIRECTORY = "characters";
  var CHATS_DIRECTORY = "chats";
  var CHARACTER_DATABASE = "char.sqlite";
  var DATABASE_EXTENSION = ".sqlite";
  function databaseLocation(charDbId, chatDbId) {
    if (charDbId === undefined)
      return { directories: [], file: GLOBAL_DATABASE };
    if (!chatDbId)
      return { directories: [CHARACTERS_DIRECTORY, charDbId], file: CHARACTER_DATABASE };
    return {
      directories: [CHARACTERS_DIRECTORY, charDbId, CHATS_DIRECTORY],
      file: `${chatDbId}${DATABASE_EXTENSION}`
    };
  }
  function databasePath(charDbId, chatDbId) {
    const location = databaseLocation(charDbId, chatDbId);
    return [...location.directories, location.file].join("/");
  }
  function parseDatabasePath(relativePath, entry) {
    const segments = relativePath.toLowerCase().split("/");
    if (entry === "file") {
      if (segments.length === 1)
        return segments[0] === GLOBAL_DATABASE ? { kind: "global" } : undefined;
      if (segments[0] !== CHARACTERS_DIRECTORY)
        return;
      if (segments.length === 3 && segments[2] === CHARACTER_DATABASE)
        return { kind: "char", charDbId: segments[1] };
      if (segments.length === 4 && segments[2] === CHATS_DIRECTORY && segments[3].endsWith(DATABASE_EXTENSION))
        return {
          kind: "chat",
          charDbId: segments[1],
          chatDbId: segments[3].slice(0, -DATABASE_EXTENSION.length)
        };
      return;
    }
    if (segments[0] !== CHARACTERS_DIRECTORY)
      return;
    if (segments.length === 1)
      return { kind: "characters" };
    if (segments.length === 2)
      return { kind: "character", charDbId: segments[1] };
    if (segments.length === 3 && segments[2] === CHATS_DIRECTORY)
      return { kind: "chats", charDbId: segments[1] };
    return;
  }
  var isTemporaryFileName = (name) => name.toLowerCase().endsWith(".crswap");
  function checkRelativePath(relativePath, purpose) {
    if (typeof relativePath !== "string" || !relativePath || relativePath.length > 4096)
      return "扫描路径必须是存储目录内的相对路径。";
    const segments = relativePath.split("/");
    if (segments.some((s) => !s || s === "." || s === ".." || s.includes("\\") || s.includes("\x00")))
      return "扫描路径必须是存储目录内的相对路径，不能包含空段、. 或 ..。";
    if (isTemporaryFileName(segments.at(-1)))
      return "浏览器写入临时文件不在扫描处理范围内。";
    if (purpose === "remove") {
      const lower = relativePath.toLowerCase();
      if (lower === GLOBAL_DATABASE)
        return "全局数据库不能通过扫描删除。";
      if (lower === CHARACTERS_DIRECTORY)
        return "characters 目录始终保留。";
    }
    return segments;
  }

  // src/worker/entity-deletions.ts
  var domain3 = (b) => JSON.stringify([b.storageId, b.configGeneration]);
  var stale = () => new ServiceError({
    code: "STALE_IDENTITY",
    resultKind: "identity",
    resultState: "not-applied",
    message: "原角色或聊天已删除，旧代理不能重新生成身份或创建数据库。"
  });
  function deletionTicket(task) {
    return {
      taskId: task.taskId,
      operationId: task.operationId,
      kind: task.chat ? "chat" : "char",
      entity: task.entity,
      stage: task.phase === "invalidated" ? "applied" : task.phase === "cancelled" ? "cancelled" : task.phase === "blocked" ? "unconfirmed" : "pending",
      revision: task.revision,
      credentials: task.credentials,
      ...task.reference ? { expected: task.reference } : {},
      ...task.deleteChats !== undefined ? { deleteChats: task.deleteChats } : {},
      ...task.reason ? { reason: task.reason } : {}
    };
  }

  class EntityDeletions {
    storage;
    changed;
    tasks = new Map;
    cleanups = new Map;
    discoveries = new Map;
    running = new Map;
    scanning = new Map;
    revisions = new Map;
    tail = Promise.resolve();
    constructor(storage, changed = () => {}) {
      this.storage = storage;
      this.changed = changed;
    }
    serialize(work) {
      const next = this.tail.then(work);
      this.tail = next.catch(() => {});
      return next;
    }
    key(b, taskId) {
      return `${domain3(b)}:${taskId}`;
    }
    revision(binding) {
      return this.revisions.get(domain3(binding)) ?? 0;
    }
    inDomain(binding, key) {
      return key.startsWith(`${domain3(binding)}:`);
    }
    isCleanupWaiting(binding, target) {
      for (const [key, t] of this.cleanups)
        if (this.inDomain(binding, key) && t.scope === target.scope && t.charDbId === target.charDbId && t.chatDbId === target.chatDbId && t.phase === "waiting")
          return true;
      return false;
    }
    updateCleanup(binding, task, phase, reason) {
      const next = { ...task, phase };
      delete next.reason;
      if (reason)
        next.reason = reason;
      if (["done", "retained", "blocked"].includes(phase))
        this.cleanups.delete(this.key(binding, task.taskId));
      else
        this.cleanups.set(this.key(binding, task.taskId), next);
      return next;
    }
    forgetCleanups(binding, deletionTaskId) {
      for (const [key, value] of this.cleanups)
        if (this.inDomain(binding, key) && value.deletionTaskId === deletionTaskId)
          this.cleanups.delete(key);
    }
    hasDeletedCoordinate(binding, entity, chat, generation) {
      const c = coordinate(entity, chat);
      for (const [key, t] of this.tasks)
        if (this.inDomain(binding, key) && t.phase !== "cancelled" && t.revision > (binding.entityRevision ?? -1) && (t.entity === entity && t.chat === chat || chat && !t.chat && t.entity === c.avatar) && (generation === undefined || t.reference?.generation === generation))
          return true;
      return false;
    }
    matches(task, entity, chat) {
      if (task.entity === entity && task.chat === chat)
        return true;
      return !task.chat && chat && coordinate(entity, true).avatar === task.entity;
    }
    assertEntity(binding, entity, chat = false) {
      if (!entity)
        return;
      for (const [key, found] of this.discoveries)
        if (key.startsWith(`${domain3(binding)}:`) && this.matches(found, entity, chat)) {
          throw new ServiceError({
            code: "ENTITY_DELETE_PENDING",
            resultKind: "identity",
            resultState: "not-applied",
            deleteStage: "pending",
            message: "原对象的删除正在核对，本次 SQL 未执行。"
          });
        }
      for (const [key, task] of this.tasks) {
        if (!key.startsWith(`${domain3(binding)}:`) || task.phase === "cancelled")
          continue;
        const generation = chat ? binding.chatIdentityGeneration : binding.identityGeneration;
        const credential = task.credentials.some((c) => c.entity === entity && c.chat === chat && generation !== undefined && c.generation === generation && ((chat ? binding.chatReferenceId : binding.characterReferenceId) === undefined || c.referenceId === (chat ? binding.chatReferenceId : binding.characterReferenceId)));
        const affected = this.matches(task, entity, chat) || credential;
        if (!affected)
          continue;
        if (task.phase !== "invalidated")
          throw new ServiceError({
            code: task.phase === "blocked" ? "ENTITY_DELETE_UNCONFIRMED" : "ENTITY_DELETE_PENDING",
            resultKind: "identity",
            resultState: "not-applied",
            deleteStage: task.phase === "blocked" ? "unconfirmed" : "pending",
            message: "原对象的删除结果尚未核对，本次 SQL 未执行。"
          });
        if (credential || (binding.entityRevision ?? -1) < task.revision)
          throw stale();
      }
    }
    assertBinding(binding) {
      this.assertEntity(binding, binding.characterEntity);
      this.assertEntity(binding, binding.chatEntity, true);
    }
    async verify(binding, entity, chat = false) {
      this.assertEntity(binding, entity, chat);
      await this.storage.manageEntities(binding, async () => {
        const generation = chat ? binding.chatIdentityGeneration : binding.identityGeneration;
        if (this.hasDeletedCoordinate(binding, entity, chat, generation))
          throw stale();
      });
    }
    begin(kind, entity, operationId, deleteChats, binding) {
      if (!["char", "chat"].includes(kind) || !isUuid(operationId) || deleteChats !== undefined && typeof deleteChats !== "boolean")
        return Promise.reject(new ServiceError({ code: "INVALID_REQUEST", message: "删除通知参数无效。" }));
      coordinate(entity, kind === "chat");
      if (!binding)
        return Promise.reject(new ServiceError({ code: "ENTITY_DELETE_PENDING", message: "请先授权原数据库目录。" }));
      const discovery = this.key(binding, operationId);
      this.discoveries.set(discovery, { entity, chat: kind === "chat" });
      return this.serialize(() => this.storage.manageEntities(binding, async (records) => {
        const task = await this.beginDeletion(binding, records, {
          entity,
          chat: kind === "chat",
          operationId,
          ...deleteChats !== undefined ? { deleteChats } : {}
        });
        this.revisions.set(domain3(binding), Math.max(this.revision(binding), task.revision));
        this.tasks.set(this.key(binding, task.taskId), task);
        const ticket = deletionTicket(task);
        this.changed(binding, ticket);
        return ticket;
      })).finally(() => this.discoveries.delete(discovery));
    }
    async beginDeletion(binding, records, input) {
      await records.ready();
      const previous = this.tasks.get(this.key(binding, input.operationId));
      if (previous)
        return structuredClone(previous);
      const found = await records.deletions.readDeletion(input);
      return {
        ...input,
        taskId: input.operationId,
        revision: this.revision(binding) + 1,
        entity: found.entity,
        ...found.reference ? { reference: found.reference } : {},
        ...!input.chat ? { roleRecordId: found.roleRecordId } : {},
        children: found.children,
        credentials: found.credentials,
        phase: "observed",
        version: 1
      };
    }
    pending(binding) {
      return Promise.resolve([...this.tasks].filter(([key, t]) => key.startsWith(`${domain3(binding)}:`) && t.phase === "observed").map(([, t]) => deletionTicket(t)));
    }
    settle(input, binding) {
      return this.serialize(async () => {
        const key = this.key(binding, input.taskId), task = this.tasks.get(key);
        if (!task || task.entity !== input.entity || task.chat !== (input.kind === "chat") || JSON.stringify(task.reference) !== JSON.stringify(input.expected))
          throw stale();
        try {
          if (!input.confirmed)
            throw new ServiceError({
              code: "ENTITY_DELETE_UNCONFIRMED",
              message: "酒馆删除结果无法确认，未清理数据库；请稍后扫描核对。"
            });
          if (!input.absent) {
            if (task.chat ? input.observedId !== (task.reference?.id ?? null) : input.nativeResult !== "failed")
              throw stale();
            const ticket = { ...deletionTicket(task), stage: "cancelled" };
            this.changed(binding, ticket);
            return ticket;
          }
          const deletion = await this.storage.manageEntities(binding, async (records) => {
            const cleanups = await records.deletions.settleDeletion(task, {
              childrenDeleted: task.deleteChats === true && input.remainingChatNames?.length === 0
            });
            if (!cleanups)
              return task;
            const invalidated = { ...task, phase: "invalidated", version: task.version + 1 };
            delete invalidated.reason;
            for (const t of cleanups)
              this.cleanups.set(this.key(binding, t.taskId), t);
            return invalidated;
          });
          this.tasks.set(key, deletion);
          const ticket = deletionTicket(deletion);
          this.changed(binding, ticket);
          const outcomes = await this.cleanup(binding);
          if (outcomes.every((t) => t.phase === "done" || t.phase === "retained"))
            await this.storage.manageEntities(binding, (records) => records.deletions.finishDeletion(deletion));
          return ticket;
        } finally {
          await this.storage.manageEntities(binding, async () => {
            this.tasks.delete(key);
            this.forgetCleanups(binding, task.taskId);
          }).catch(() => {});
        }
      });
    }
    cleanScan(input, binding) {
      if (!input || !isUuid(input.operationId) || !input.expected || typeof input.removeRecord !== "boolean" || typeof input.removeFile !== "boolean" || !["char", "chat"].includes(input.expected.scope) || !Number.isSafeInteger(input.expected.referenceId) || input.expected.referenceId < 1 || !input.observation || !["deleted", "same", "unknown"].includes(input.observation.status) || input.parentDeleted !== undefined && input.parentDeleted !== true)
        return Promise.reject(new ServiceError({ code: "INVALID_REQUEST", message: "扫描清理必须提供原记录、核对结果和确认范围。" }));
      const request = structuredClone(input);
      const work = this.serialize(async () => {
        await this.running.get(domain3(binding));
        const expected = request.expected;
        const relativePath = expected.id ? databasePath(expected.scope === "char" ? expected.id : String(expected.parent), expected.scope === "chat" ? expected.id : undefined) : undefined;
        const result = {
          scope: expected.scope,
          referenceId: expected.referenceId,
          partial: true,
          file: {
            status: expected.id ? "blocked" : "none",
            ...relativePath ? { relativePath } : {},
            message: expected.id ? "数据库文件尚未清理。" : "原记录没有数据库文件编号。"
          },
          record: { status: "blocked", message: "原管理记录尚未删除。" }
        };
        const blocked = (message) => {
          result.record.message = result.marked ? `${expected.scope === "char" ? "角色已标记为删除，其下聊天改为保留状态" : "聊天已标记为删除"}，这一修改已保存；${message}` : message;
          if (result.file.status === "blocked")
            result.file.message = message;
          return result;
        };
        const parentDeleted = request.parentDeleted === true;
        let current;
        try {
          current = await this.storage.manageEntities(binding, (records) => records.deletions.assertScanRecord(expected, true, parentDeleted));
        } catch (error) {
          if (errorData(error).code !== "STALE_IDENTITY")
            throw error;
          result.record = { status: "removed", message: "原记录已清理或对象已变化，请重新扫描。" };
          result.file = { ...result.file, status: "none", message: "本次没有删除文件。" };
          result.partial = false;
          return result;
        }
        if (parentDeleted) {
          const parent = expected.scope === "chat" && current.state !== "active" ? await this.storage.manageEntities(binding, (records) => records.deletions.scanRecord({ scope: "char", referenceId: expected.parentReferenceId })) : undefined;
          if (parent?.state !== "deleted")
            return blocked("所属角色尚未确认删除，未处理这个聊天。");
        } else if (current.state !== "deleted" && request.observation.status !== "deleted")
          return blocked("原酒馆文件没有确认不存在，请重新扫描核对。");
        if (current.taskReasons.some((reason) => !reason.includes("数据库文件清理")))
          return blocked(current.taskReasons.join("；"));
        if (current.initialization === "creating")
          return blocked("原数据库首次保存尚未确认，请先完成已有恢复操作。");
        let local;
        if (expected.id) {
          local = await this.storage.scan(binding, {
            operation: "file",
            charDbId: expected.scope === "char" ? expected.id : expected.parent,
            ...expected.scope === "chat" ? { chatDbId: expected.id } : {}
          });
          if (local.status === "unknown")
            return blocked(local.reason ?? "无法确认原数据库文件。");
          if (current.initialization === "never" && local.status === "exists")
            return blocked("管理记录显示数据库从未创建，但本地已有文件，请核对来源；未删除文件和记录。");
          if (parentDeleted && current.state !== "deleted" && current.initialization === "ready" && local.status === "missing")
            return blocked("管理记录显示聊天数据库已创建，但本地文件不存在；保留这个聊天的记录。");
          const protection = await this.storage.manageEntities(binding, (records) => records.deletions.protectionReferences({
            scope: expected.scope,
            charDbId: local.charDbId,
            chatDbId: local.chatDbId
          }));
          const ownActive = current.state === "active" && current.confirmed ? 1 : 0, ownRetained = current.state === "retained" ? 1 : 0;
          const shared = protection.active > ownActive || protection.retained > ownRetained || protection.unconfirmed > (current.state !== "deleted" && !current.confirmed ? 1 : 0);
          if (local.status === "exists" && !request.removeFile && !shared)
            return blocked("这个数据库文件目前没有共享引用，但本次确认范围没有允许删除文件，请重新扫描选择。");
        }
        const prepared = await this.storage.manageEntities(binding, async (records) => {
          const result = await records.deletions.prepareScanDeletion(expected, request.operationId, parentDeleted, this.revision(binding) + 1);
          if (result.cleanup)
            this.cleanups.set(this.key(binding, result.cleanup.taskId), result.cleanup);
          this.revisions.set(domain3(binding), result.deletion.revision);
          return result;
        });
        this.tasks.set(this.key(binding, prepared.deletion.taskId), prepared.deletion);
        this.changed(binding, deletionTicket(prepared.deletion));
        if (current.state !== "deleted")
          result.marked = true;
        if (prepared.cleanup) {
          const task = prepared.cleanup;
          const target = {
            storageId: binding.storageId,
            configGeneration: binding.configGeneration,
            scope: task.scope,
            charDbId: task.charDbId,
            ...task.chatDbId ? { chatDbId: task.chatDbId } : {}
          };
          const protection = await this.storage.manageEntities(binding, (records) => records.deletions.protectionReferences(target));
          if (protection.active || protection.retained || protection.unconfirmed) {
            result.file = {
              ...result.file,
              status: "shared",
              message: "数据库文件仍被其他有效或保留对象使用，继续保留。"
            };
            await this.storage.manageEntities(binding, async () => this.updateCleanup(binding, task, "retained", "remaining-reference"));
          } else if (!request.removeFile && local?.status === "exists")
            return blocked("文件引用已改变，本次确认范围没有允许删除文件，请重新扫描。");
          else {
            const tasks = await this.cleanup(binding, task.taskId);
            const outcome = tasks.find((row) => row.taskId === task.taskId);
            if (outcome?.phase !== "done")
              return blocked(outcome?.reason === "permission-required" ? "目录权限不足，文件未确认清理；请恢复授权后重试。" : outcome?.reason === "file-remove-failed" ? "数据库文件删除失败，保留管理记录，请重试。" : "原数据库保存或清理结果尚未确认，保留管理记录，请先核对原操作。");
            result.file = {
              ...result.file,
              status: local?.status === "missing" ? "missing" : "removed",
              message: local?.status === "missing" ? "数据库文件已确认不存在。" : "原数据库文件已精确删除。"
            };
          }
        }
        const after = await this.storage.manageEntities(binding, (records) => records.deletions.assertScanRecord(expected, true));
        if (!request.removeRecord || after.parentDependency) {
          result.record = {
            status: "retained",
            message: after.parentDependency ? "保留的聊天仍需要父角色记录定位，管理记录继续保留。" : "本次只确认清理数据库文件，管理记录继续保留。"
          };
          return result;
        }
        if (expected.scope === "char" && await this.storage.manageEntities(binding, (records) => records.deletions.hasScanChildren(expected.referenceId)))
          return blocked("父角色下仍有未清理的聊天记录，请先清理所选聊天再处理角色记录。");
        await this.storage.manageEntities(binding, (records) => records.deletions.purgeScanRecord(expected));
        await this.storage.manageEntities(binding, async () => {});
        result.record = { status: "removed", message: "原管理记录已删除并确认保存。" };
        result.partial = false;
        return result;
      });
      const id = domain3(binding);
      this.scanning.set(id, work);
      work.finally(async () => {
        if (this.scanning.get(id) === work)
          this.scanning.delete(id);
        await this.storage.manageEntities(binding, async () => {
          this.tasks.delete(this.key(binding, request.operationId));
          this.forgetCleanups(binding, request.operationId);
        });
      }).catch(() => {});
      return work;
    }
    resume(binding) {
      const scanning = this.scanning.get(domain3(binding));
      if (scanning)
        return scanning.then(() => this.resume(binding), () => this.resume(binding));
      const id = domain3(binding), previous = this.running.get(id);
      if (previous)
        return previous;
      const work = this.cleanup(binding);
      this.running.set(id, work);
      work.finally(() => {
        if (this.running.get(id) === work)
          this.running.delete(id);
      }).catch(() => {});
      return work;
    }
    async cleanup(binding, selectedTaskId) {
      const tasks = await this.storage.manageEntities(binding, async () => structuredClone([...this.cleanups].filter(([key]) => this.inDomain(binding, key)).map(([, task]) => task)));
      const results = [];
      for (let task of tasks) {
        if (selectedTaskId && task.taskId !== selectedTaskId)
          continue;
        if (["done", "retained"].includes(task.phase)) {
          results.push(task);
          continue;
        }
        const target = {
          storageId: binding.storageId,
          configGeneration: binding.configGeneration,
          scope: task.scope,
          charDbId: task.charDbId,
          ...task.chatDbId ? { chatDbId: task.chatDbId } : {}
        };
        const update = async (phase, reason) => {
          task = await this.storage.manageEntities(binding, async () => this.updateCleanup(binding, task, phase, reason));
        };
        try {
          const deletion = this.tasks.get(this.key(binding, task.deletionTaskId));
          if (!deletion || deletion.phase !== "invalidated") {
            await update("blocked", "invalidation-unconfirmed");
            results.push(task);
            continue;
          }
          const check = async (records) => {
            const protection = await records.deletions.protectionReferences(target);
            if (protection.active || protection.retained || protection.unconfirmed)
              throw new ServiceError({ code: "IDENTITY_CONFLICT", message: "数据库仍有有效、保留或未确认引用。" });
          };
          const protection = await this.storage.manageEntities(binding, (records) => records.deletions.protectionReferences(target));
          if (protection.active || protection.retained || protection.unconfirmed) {
            await update("retained", "remaining-reference");
            results.push(task);
            continue;
          }
          this.storage.sealCleanup(target);
          await this.storage.drainCleanup(target);
          await this.storage.removeCleanupFile(target, check);
          if (!selectedTaskId)
            await this.storage.manageEntities(binding, (records) => records.deletions.finishCleanup(task));
          await update("done");
        } catch (error) {
          await update("blocked", errorData(error).code === "PERMISSION_REQUIRED" ? "permission-required" : "file-remove-failed").catch(() => {});
        } finally {
          this.storage.releaseCleanup(target);
        }
        results.push(task);
      }
      return results;
    }
    assertSettled() {
      if (this.discoveries.size || this.running.size || this.scanning.size)
        throw new ServiceError({
          code: "ENTITY_DELETE_UNCONFIRMED",
          resultKind: "identity",
          message: "删除记录或文件清理仍在进行，尚不能确认安全排空。"
        });
    }
  }

  // src/core/sql.ts
  var invalid = (message) => {
    throw new ServiceError({ code: "INVALID_REQUEST", message, failureKind: "request-rejected" });
  };
  function skipHead(sql, emptySeparators = false) {
    let rest = sql;
    while (rest.length) {
      const whitespace = /^\s+/.exec(rest);
      if (whitespace) {
        rest = rest.slice(whitespace[0].length);
        continue;
      }
      if (emptySeparators && rest.startsWith(";")) {
        rest = rest.slice(1);
        continue;
      }
      if (rest.startsWith("--")) {
        const end = rest.search(/[\r\n]/);
        rest = end < 0 ? "" : rest.slice(end);
        continue;
      }
      if (rest.startsWith("/*")) {
        const end = rest.indexOf("*/", 2);
        if (end < 0)
          return invalid("SQL 头部块注释未闭合。");
        rest = rest.slice(end + 2);
        continue;
      }
      break;
    }
    return rest;
  }
  function checkQueryPrefix(sql) {
    checkPrefix(sql, "query");
  }
  var keywords = {
    query: ["SELECT"],
    update: ["INSERT", "UPDATE", "DELETE", "REPLACE"],
    transaction: ["INSERT", "UPDATE", "DELETE", "REPLACE", "CREATE", "ALTER", "DROP"],
    exec: ["CREATE", "ALTER", "DROP"]
  };
  function checkPrefix(sql, method) {
    if (typeof sql !== "string")
      return invalid("SQL 必须是字符串。");
    const head = skipHead(sql);
    const keyword = /^[A-Za-z0-9_$\u0080-\uffff]+/.exec(head)?.[0].toUpperCase();
    if (!keyword || !keywords[method].includes(keyword))
      return invalid(`${method} 只接受 ${keywords[method].join(" / ")} 语句。`);
  }
  function prepareQuery(db, sql) {
    return prepareSingle(db, sql, "query");
  }
  function prepareSingle(db, sql, method) {
    checkPrefix(sql, method);
    const stmt = db.prepare(sql);
    try {
      const remaining = sql.slice(stmt.getSQL().length);
      if (skipHead(remaining, true).length)
        return invalid(`${method} 只接受一条语句，不能附带额外 SQL。`);
      return stmt;
    } catch (error) {
      try {
        stmt.free();
      } catch {}
      throw error;
    }
  }
  function validateCheckedCommands(input) {
    if (!Array.isArray(input) || input.length === 0)
      return invalid("检查事务必须包含命令。");
    const arrayFields = Object.getOwnPropertyDescriptors(input);
    if (Object.getOwnPropertySymbols(input).length || Object.keys(arrayFields).some((key) => key !== "length" && (!/^(0|[1-9]\d*)$/.test(key) || Number(key) >= input.length)) || Object.keys(arrayFields).length !== input.length + 1 || Object.entries(arrayFields).some(([key, field]) => key !== "length" && (!("value" in field) || !field.enumerable)))
      return invalid("检查事务命令数组不能包含空位、访问器或额外属性。");
    for (const command of input) {
      if (!command || typeof command !== "object" || Array.isArray(command))
        return invalid("检查事务命令必须是对象。");
      const fields = Object.getOwnPropertyDescriptors(command);
      if (Object.getOwnPropertySymbols(command).length || Object.values(fields).some((field) => !("value" in field) || !field.enumerable))
        return invalid("检查事务命令只能包含普通字段。");
      const kind = fields.kind?.value, sql = fields.sql?.value;
      if (kind !== "check" && kind !== "write")
        return invalid("检查事务命令类型无效。");
      const allowed = kind === "check" ? ["kind", "sql", "binds"] : ["kind", "sql", "binds", "expectChanges"];
      if (Object.keys(fields).some((key) => !allowed.includes(key)))
        return invalid("检查事务命令包含未知字段。");
      checkPrefix(sql, kind === "check" ? "query" : "transaction");
      if (fields.expectChanges) {
        const count = fields.expectChanges.value;
        if (!Number.isSafeInteger(count) || count < 0)
          return invalid("expectChanges 必须是非负安全整数。");
        checkPrefix(sql, "update");
      }
    }
  }

  // src/core/sqlite-errors.ts
  var captured = new WeakSet;

  class SQLiteFailure extends Error {
    sqliteCode;
    original;
    constructor(message, sqliteCode, original) {
      super(message);
      this.sqliteCode = sqliteCode;
      this.original = original;
      this.name = "SQLiteFailure";
      captured.add(this);
    }
  }
  function wrapSQLiteErrors(db) {
    const instance = db;
    const original = instance.handleError;
    if (typeof original !== "function")
      return;
    instance.handleError = function(returnCode) {
      try {
        return original.call(db, returnCode);
      } catch (error) {
        if (!Number.isInteger(returnCode))
          throw error;
        throw new SQLiteFailure(error instanceof Error ? error.message : String(error), returnCode, error);
      }
    };
  }
  function sqliteCode(error) {
    return error && typeof error === "object" && captured.has(error) ? error.sqliteCode : undefined;
  }
  function sqliteFailureKind(error, phase) {
    const code = sqliteCode(error);
    if (phase === "binding" && code === 25)
      return "request-rejected";
    if (["command", "binding", "commit"].includes(phase) && (code === 19 || code === 20))
      return "sql-rejected";
    return "service";
  }

  // src/viewer-contracts.ts
  var VIEWER_LIMITS = Object.freeze({
    rows: 20000,
    columns: 200,
    resultBytes: 16 * 1024 * 1024,
    detailCharacters: 1048576,
    previewCharacters: 100
  });

  // src/core/viewer-read.ts
  var invalid2 = (message) => {
    throw new ServiceError({ code: "INVALID_REQUEST", message });
  };
  var exceeded = (message) => {
    throw new ServiceError({ code: "VIEWER_LIMIT_EXCEEDED", message });
  };
  var quote = (name) => `"${name.replaceAll('"', '""')}"`;
  function query(db, sql, binds = []) {
    const stmt = db.prepare(sql);
    try {
      stmt.bind(binds);
      const rows = [];
      while (stmt.step())
        rows.push(stmt.get());
      return rows;
    } finally {
      stmt.free();
    }
  }
  function tables(db) {
    return query(db, "SELECT name FROM pragma_table_list WHERE schema='main' AND type='table' AND name IN (SELECT name FROM sqlite_master WHERE type='table') ORDER BY name").map((r) => String(r[0]));
  }
  function schema(db, table) {
    const rows = query(db, "SELECT name,type,pk,hidden FROM pragma_table_xinfo(?) ORDER BY cid", [table]);
    if (rows.length > VIEWER_LIMITS.columns)
      exceeded(`当前表超过 ${VIEWER_LIMITS.columns} 列，未读取预览。`);
    const columns = rows.filter((r) => r[3] !== 1).map((r) => ({ name: String(r[0]), declaredType: String(r[1]), primaryKeyOrder: Number(r[2]), sortable: true }));
    const keys = [];
    const primary = columns.filter((c) => c.primaryKeyOrder).sort((a, b) => a.primaryKeyOrder - b.primaryKeyOrder).map((c) => c.name);
    if (primary.length)
      keys.push(primary);
    const indices = query(db, 'SELECT name FROM pragma_index_list(?) WHERE "unique"=1 AND partial=0 ORDER BY seq', [
      table
    ]);
    for (const row of indices) {
      const parts = query(db, "SELECT cid,name,coll FROM pragma_index_xinfo(?) WHERE key=1 ORDER BY seqno", [row[0]]);
      if (parts.length && parts.every((p) => Number(p[0]) >= 0 && typeof p[1] === "string" && columns.some((c) => c.name === p[1]))) {
        const key = parts.map((p) => String(p[1]));
        if (!keys.some((k) => JSON.stringify(k) === JSON.stringify(key)))
          keys.push(key);
      }
    }
    return { columns, keys };
  }
  function cell(type, value, length) {
    if (type === "null")
      return { type: "null" };
    if (type === "blob")
      return { type: "blob", bytes: Number(length) };
    if (type === "text")
      return { type: "text", value: String(value), truncated: Number(length) === 1 };
    if (type === "integer" && !Number.isSafeInteger(Number(value)))
      exceeded("当前表包含超出 JavaScript 安全整数范围的数字，无法准确预览；未返回舍入后的数据。");
    if (type === "integer" || type === "real")
      return { type, value: Number(value) };
    return invalid2("数据库返回了未支持的实际值类型。");
  }
  function projected(name, characters) {
    const c = quote(name), preview = `substr(${c},1,${characters})`;
    return `typeof(${c}),CASE typeof(${c}) WHEN 'text' THEN ${preview} WHEN 'integer' THEN CAST(${c} AS TEXT) WHEN 'blob' THEN NULL ELSE ${c} END,CASE typeof(${c}) WHEN 'blob' THEN length(${c}) WHEN 'text' THEN length(CAST(${c} AS BLOB))>length(CAST(${preview} AS BLOB)) ELSE 0 END`;
  }
  function readViewer(db, request) {
    if (!request || !["tables", "table", "ddl", "detail"].includes(request.operation))
      invalid2("不支持的数据库查看操作。");
    const names = tables(db);
    if (request.operation === "tables")
      return { tables: names };
    if (typeof request.table !== "string" || !names.includes(request.table))
      invalid2("指定表不存在或不是可查看的普通数据表。");
    const table = request.table;
    if (request.operation === "ddl")
      return {
        table,
        ddl: query(db, "SELECT sql FROM sqlite_master WHERE type='table' AND name=?", [table])[0]?.[0] ?? null
      };
    const info = schema(db, table);
    if (request.operation === "detail") {
      const key = request.key;
      if (!info.columns.some((c) => c.name === request.column) || !key || !Array.isArray(key.columns) || !Array.isArray(key.values) || key.columns.length !== key.values.length || !info.keys.some((k) => JSON.stringify(k) === JSON.stringify(key.columns)) || key.values.some((v) => typeof v !== "string" && (typeof v !== "number" || !Number.isFinite(v) || Number.isInteger(v) && !Number.isSafeInteger(v))))
        invalid2("文本详情需要完整、非 NULL、非二进制的可靠键值。");
      const rows = query(db, `SELECT ${projected(request.column, VIEWER_LIMITS.detailCharacters)} FROM ${quote(table)} WHERE ${key.columns.map((c) => `${quote(c)} COLLATE BINARY = ?`).join(" AND ")} LIMIT 2`, key.values);
      if (rows.length > 1)
        invalid2("键值对应多条记录，无法可靠定位详情。");
      if (!rows.length)
        return { found: false };
      const value = cell(...rows[0]);
      if (value.type !== "text")
        return { found: true, type: value.type };
      return { found: true, type: "text", text: value.value, truncated: value.truncated };
    }
    if (!info.columns.length)
      invalid2("当前表没有可读取字段。");
    const locatorColumns = [...new Set(info.keys.flat())];
    const locator = locatorColumns.flatMap((c) => [
      `CASE WHEN typeof(${quote(c)})='text' AND instr(${quote(c)},char(0))>0 THEN 'invalid' ELSE typeof(${quote(c)}) END`,
      `CASE WHEN typeof(${quote(c)})='blob' OR typeof(${quote(c)})='text' AND instr(${quote(c)},char(0))>0 THEN NULL ELSE ${quote(c)} END`
    ]);
    const sql = `SELECT ${info.columns.map((c) => projected(c.name, VIEWER_LIMITS.previewCharacters)).join(",")}${locator.length ? `,${locator.join(",")}` : ""} FROM ${quote(table)} LIMIT ${VIEWER_LIMITS.rows + 1}`;
    const stmt = db.prepare(sql);
    const result = {
      table,
      columns: info.columns,
      rows: [],
      keyColumns: info.keys[0] ?? [],
      initialSortColumns: info.columns.filter((c) => c.primaryKeyOrder).sort((a, b) => a.primaryKeyOrder - b.primaryKeyOrder).map((c) => c.name)
    };
    let bytes = new TextEncoder().encode(JSON.stringify(result)).byteLength;
    try {
      while (stmt.step()) {
        if (result.rows.length === VIEWER_LIMITS.rows)
          exceeded(`当前表超过 ${VIEWER_LIMITS.rows} 行，未返回不完整预览。`);
        const raw = stmt.get();
        const cells = info.columns.map((_, i) => cell(raw[i * 3], raw[i * 3 + 1], raw[i * 3 + 2]));
        const values = new Map(locatorColumns.map((c, i) => [
          c,
          { type: raw[info.columns.length * 3 + i * 2], value: raw[info.columns.length * 3 + i * 2 + 1] }
        ]));
        const key = info.keys.find((k) => k.every((c) => {
          const entry = values.get(c);
          return entry.type === "text" && typeof entry.value === "string" && !entry.value.includes("\x00") || (entry.type === "integer" || entry.type === "real") && typeof entry.value === "number" && Number.isFinite(entry.value) && (!Number.isInteger(entry.value) || Number.isSafeInteger(entry.value));
        }));
        const row = {
          cells,
          ...key ? { key: { columns: key, values: key.map((c) => values.get(c).value) } } : {}
        };
        bytes += new TextEncoder().encode(JSON.stringify(row)).byteLength;
        if (bytes > VIEWER_LIMITS.resultBytes)
          exceeded("当前表预览及完整键值超过 16 MiB，未返回不完整预览。");
        result.rows.push(row);
      }
    } finally {
      stmt.free();
    }
    for (let i = 0;i < result.columns.length; i++)
      if (result.rows.some((r) => r.cells[i]?.type === "blob"))
        result.columns[i].sortable = false;
    if (result.initialSortColumns.some((c) => !result.columns.find((v) => v.name === c)?.sortable))
      result.initialSortColumns = [];
    return result;
  }

  // src/core/database.ts
  class PersistenceFailure extends ServiceError {
    stage;
    fileState;
    constructor(data, stage, fileState) {
      super(data);
      this.stage = stage;
      this.fileState = fileState;
    }
  }
  var META2 = "__stsh_meta";
  var SCOPED_META_TABLE_SQL = `CREATE TABLE IF NOT EXISTS ${META2} (key TEXT PRIMARY KEY, value TEXT NOT NULL)`;

  class SingleDatabase {
    SQL;
    storage;
    onBackgroundSaveFailed;
    saveDebounceMs;
    db;
    state = "new";
    transient = false;
    initializationCommitted = false;
    dirty = false;
    unsaved = false;
    saveTimer;
    saveTask;
    savesSealed = false;
    firstSaveHooks;
    fileBaseline;
    loadFailure;
    backgroundFailure;
    tail = Promise.resolve();
    onUnsavedChanged;
    constructor(SQL, storage, onBackgroundSaveFailed, saveDebounceMs = 1000) {
      this.SQL = SQL;
      this.storage = storage;
      this.onBackgroundSaveFailed = onBackgroundSaveFailed;
      this.saveDebounceMs = saveDebounceMs;
    }
    get availability() {
      return this.state;
    }
    get loadFailureStage() {
      return this.loadFailure;
    }
    get hasPendingFirstCommit() {
      return this.transient && this.initializationCommitted;
    }
    get unsavedChanges() {
      return this.unsaved;
    }
    markUnsaved(value) {
      if (this.unsaved === value)
        return;
      this.unsaved = value;
      this.onUnsavedChanged?.();
    }
    sealBackgroundSaves() {
      this.savesSealed = true;
      const cancelled = this.saveTask !== undefined;
      this.cancelPendingSave();
      return cancelled;
    }
    resumeBackgroundSaves(cancelled) {
      if (this.state !== "ready")
        return;
      this.savesSealed = false;
      if (cancelled && this.dirty)
        this.scheduleSave();
    }
    drain() {
      return this.enqueue(async () => {});
    }
    async waitForMaintenanceSave(timeoutMs = 1e4) {
      const deadline = Date.now() + timeoutMs;
      const timeout = () => new ServiceError({
        code: "RESULT_UNCONFIRMED",
        resultState: "not-applied",
        retryable: false,
        message: "数据仍在保存，本次修复没有开始；请等待保存完成后重新扫描。"
      });
      for (;; ) {
        const remaining = deadline - Date.now();
        if (remaining <= 0)
          throw timeout();
        let timer;
        try {
          await Promise.race([
            this.tail,
            new Promise((_, reject) => {
              timer = setTimeout(() => reject(timeout()), remaining);
            })
          ]);
        } finally {
          clearTimeout(timer);
        }
        if (this.backgroundFailure && !this.saveTask && (this.dirty || this.state !== "ready"))
          throw new ServiceError({
            ...this.backgroundFailure,
            code: "RESULT_UNCONFIRMED",
            resultState: "not-applied",
            retryable: false,
            message: `已有修改未能保存，本次修复没有开始；${this.state === "ready" ? "内存数据仍可读取，请先处理保存问题。" : "请先处理保存问题并确认文件内容。"}`
          });
        if (this.state !== "ready")
          return;
        if (this.transient && !this.initializationCommitted)
          return;
        if (!this.dirty)
          break;
        await new Promise((resolve) => setTimeout(resolve, Math.min(20, remaining)));
      }
      const readback = this.enqueue(async () => {
        if (this.state !== "ready")
          return;
        if (this.dirty)
          throw timeout();
        const saved = await this.storage.read();
        const expected = this.ready().export();
        this.configure(this.ready());
        if (!saved || saved.length !== expected.length || saved.some((value, index) => value !== expected[index]))
          throw new ServiceError({
            code: "RESULT_UNCONFIRMED",
            resultState: "not-applied",
            retryable: false,
            message: "保存后的文件与当前数据不一致，本次修复没有开始；请重新扫描。"
          });
      });
      let timer;
      try {
        await Promise.race([
          readback,
          new Promise((_, reject) => {
            timer = setTimeout(() => reject(timeout()), Math.max(0, deadline - Date.now()));
          })
        ]);
      } finally {
        clearTimeout(timer);
      }
    }
    close() {
      this.sealBackgroundSaves();
      return this.enqueue(async () => {
        this.disable();
      });
    }
    closeForRestart() {
      this.sealBackgroundSaves();
      const db = this.db;
      this.db = undefined;
      this.state = "disabled";
      this.dirty = false;
      this.unsaved = false;
      this.firstSaveHooks = undefined;
      db?.close();
    }
    enqueue(task) {
      const result = this.tail.then(task);
      this.tail = result.catch(() => {
        return;
      });
      return result;
    }
    disable() {
      this.cancelPendingSave();
      this.state = "disabled";
      this.transient = false;
      this.initializationCommitted = false;
      this.dirty = false;
      this.firstSaveHooks = undefined;
      this.fileBaseline = undefined;
      this.backgroundFailure = undefined;
      const db = this.db;
      this.db = undefined;
      try {
        db?.close();
      } catch {}
      this.markUnsaved(false);
    }
    ready() {
      if (this.state !== "ready" || !this.db)
        throw new ServiceError({
          code: this.state === "new" ? "NOT_INITIALIZED" : "INSTANCE_DISABLED",
          message: this.state === "new" ? "数据库尚未打开，本次 SQL 未执行；请先初始化存储。" : "数据库实例已停用，本次 SQL 未执行；请先从文件恢复数据库。"
        });
      return this.db;
    }
    configure(db) {
      db.run("PRAGMA foreign_keys = ON");
    }
    async persist(db, create = false, management = false) {
      let bytes;
      try {
        bytes = db.export();
        this.configure(db);
      } catch (error) {
        this.disable();
        throw new PersistenceFailure({
          code: "SAVE_FAILED",
          failureKind: "service",
          message: `导出失败，修改未保存：${detail(error).message}`,
          saveError: detail(error),
          businessResult: management ? "not-started" : "not-saved"
        }, "export", "not-saved");
      }
      try {
        await this.storage.write(bytes, { create });
      } catch (error) {
        if (management)
          this.disable();
        throw new PersistenceFailure({
          code: "RESULT_UNCONFIRMED",
          failureKind: "service",
          message: `保存失败，无法确认修改是否落盘：${detail(error).message}`,
          saveError: detail(error),
          businessResult: management ? "not-started" : "unknown",
          resultState: "unconfirmed",
          retryable: false
        }, "write", "unknown");
      }
      this.transient = false;
      this.markUnsaved(false);
      try {
        this.fileBaseline = await this.storage.metadata?.();
      } catch (error) {
        if (management)
          this.disable();
        throw new PersistenceFailure({
          code: "LOAD_FAILED",
          failureKind: "service",
          message: `${management ? "管理记录" : "数据库"}已保存，但读取文件信息失败：${detail(error).message}`,
          causeError: detail(error),
          businessResult: management ? "not-started" : "saved",
          ...management ? {} : { databasePersisted: true }
        }, "metadata", "saved");
      }
    }
    cancelPendingSave() {
      clearTimeout(this.saveTimer);
      this.saveTimer = undefined;
      this.saveTask = undefined;
    }
    scheduleSave() {
      this.cancelPendingSave();
      if (this.savesSealed || !this.dirty || this.state !== "ready")
        return;
      const task = {}, db = this.db;
      this.saveTask = task;
      this.saveTimer = setTimeout(() => {
        this.saveTimer = undefined;
        this.enqueue(async () => {
          if (this.saveTask !== task || this.db !== db || this.savesSealed || !this.dirty || this.state !== "ready")
            return;
          this.saveTask = undefined;
          let stage = "registration", fileState = "not-saved";
          try {
            await this.firstSaveHooks?.beforeSave?.();
            await this.persist(db, this.transient);
            fileState = "saved";
            await this.firstSaveHooks?.afterSave?.();
            this.firstSaveHooks = undefined;
            this.dirty = false;
            this.backgroundFailure = undefined;
          } catch (error) {
            if (error instanceof PersistenceFailure) {
              stage = error.stage;
              fileState = error.fileState;
            }
            const data = errorData(error), memoryAvailable = this.availability === "ready";
            this.backgroundFailure = data;
            const failure = {
              stage,
              fileState,
              memoryAvailable,
              error: {
                ...data,
                failureKind: "service",
                executionState: "committed",
                databasePersisted: fileState === "saved" ? true : undefined,
                message: `${data.message}。${memoryAvailable ? "内存中的修改仍可读取；关闭或重新加载后可能丢失未保存修改。" : "当前内存实例已不可用。"}请勿重复提交原 SQL。`
              }
            };
            try {
              this.onBackgroundSaveFailed?.(failure);
            } catch {}
          }
        });
      }, this.saveDebounceMs);
      this.saveTimer.unref?.();
    }
    open() {
      return this.enqueue(() => this.load("create"));
    }
    openExisting() {
      return this.refresh();
    }
    openTransient() {
      return this.enqueue(() => this.load("transient"));
    }
    cancelPendingSaveForReload() {
      if (!this.hasPendingFirstCommit)
        this.cancelPendingSave();
    }
    refresh() {
      this.cancelPendingSaveForReload();
      return this.enqueue(async () => {
        if (this.transient && this.initializationCommitted)
          throw new ServiceError({
            code: "DATABASE_NOT_INITIALIZED",
            failureKind: "service",
            message: "数据库文件尚未创建，不能重新加载；当前内存数据仍可用。"
          });
        await this.load("existing");
      });
    }
    refreshIfChanged() {
      return this.enqueue(async () => {
        if (this.state !== "ready" || this.transient || !this.fileBaseline || !this.storage.metadata)
          return false;
        try {
          const current = await this.storage.metadata();
          if (current.lastModified <= this.fileBaseline.lastModified && current.size === this.fileBaseline.size)
            return false;
          await this.load("existing");
          return true;
        } catch (error) {
          this.disable();
          if (error instanceof ServiceError)
            throw error;
          throw new ServiceError({
            code: "LOAD_FAILED",
            message: `自动重新加载失败：${detail(error).message}`,
            causeError: detail(error),
            retryable: fileRetryable(error)
          });
        }
      });
    }
    async load(mode = "existing") {
      this.disable();
      this.loadFailure = undefined;
      let phase = "read";
      try {
        const snapshot = this.storage.readSnapshot ? await this.storage.readSnapshot() : { bytes: await this.storage.read() };
        const bytes = snapshot.bytes;
        if (mode === "existing" && bytes === null)
          throw new Error("已有数据库文件缺失，不能自动重建或确认原操作结果。");
        if (mode === "transient" && bytes !== null)
          throw new Error("首次初始化位置已有文件，拒绝覆盖。");
        phase = "database";
        if (bytes && bytes.length === 0)
          throw new Error("已有数据库文件为空。");
        this.db = new this.SQL.Database(bytes);
        wrapSQLiteErrors(this.db);
        this.configure(this.db);
        this.db.exec("SELECT name FROM sqlite_master LIMIT 1");
        if (bytes === null) {
          this.db.run("PRAGMA user_version = 0");
          if (mode === "create")
            await this.persist(this.db, true, true);
          else
            this.transient = true;
        } else {
          phase = "read";
          this.fileBaseline = snapshot.metadata ?? await this.storage.metadata?.();
        }
        this.state = "ready";
        this.savesSealed = false;
      } catch (error) {
        this.loadFailure = phase;
        this.disable();
        if (error instanceof ServiceError)
          throw error;
        throw new ServiceError({
          code: "LOAD_FAILED",
          message: `读取或打开数据库文件失败，实例不可用：${detail(error).message}`,
          causeError: detail(error),
          retryable: fileRetryable(error)
        });
      }
    }
    async checkFile() {
      this.ready();
      if (this.transient)
        return;
      try {
        if (this.storage.assertExisting)
          await this.storage.assertExisting();
        else {
          const bytes = await this.storage.read();
          if (!bytes || !bytes.length)
            throw new Error(bytes === null ? "已有数据库文件缺失。" : "已有数据库文件为空。");
        }
      } catch (error) {
        this.disable();
        if (error instanceof ServiceError && error.data.code === "PERMISSION_REQUIRED")
          throw error;
        throw new ServiceError({
          code: "LOAD_FAILED",
          message: `已有数据库文件不可用，缓存已停用：${detail(error).message}`,
          causeError: detail(error),
          retryable: fileRetryable(error)
        });
      }
    }
    replaceForMaintenance(commands, create = false) {
      const snapshot = structuredClone(commands);
      return this.enqueue(async () => {
        if (this.dirty || this.saveTask || this.hasPendingFirstCommit)
          throw new ServiceError({
            code: "RESULT_UNCONFIRMED",
            resultState: "not-applied",
            message: "仍有尚未保存的数据，本次重置没有开始。"
          });
        const replacement = new this.SQL.Database;
        wrapSQLiteErrors(replacement);
        this.configure(replacement);
        try {
          replacement.run("BEGIN");
          for (const command of snapshot)
            this.executeCommand(replacement, command);
          replacement.run("COMMIT");
          this.disable();
          this.db = replacement;
          this.state = "ready";
          await this.persist(replacement, create, true);
          this.savesSealed = false;
          this.loadFailure = undefined;
        } catch (error) {
          if (this.db === replacement)
            this.disable();
          else
            replacement.close();
          throw error;
        }
      });
    }
    assertFileExisting() {
      return this.enqueue(() => this.checkFile());
    }
    fileExists() {
      return this.enqueue(async () => {
        try {
          const bytes = await this.storage.read();
          if (bytes === null)
            return false;
          if (!bytes.length)
            throw new Error("已有数据库文件为空。");
          return true;
        } catch (error) {
          if (error instanceof ServiceError && error.data.code === "PERMISSION_REQUIRED")
            throw error;
          throw new ServiceError({
            code: "LOAD_FAILED",
            message: `无法核对数据库文件：${detail(error).message}`,
            causeError: detail(error),
            retryable: fileRetryable(error)
          });
        }
      });
    }
    getInitializationMarker() {
      return this.enqueue(async () => {
        try {
          return this.initializationMarker(this.ready());
        } catch (error) {
          this.disable();
          throw new ServiceError({
            code: "LOAD_FAILED",
            message: `数据库身份无法读取：${detail(error).message}`,
            causeError: detail(error),
            retryable: false
          });
        }
      });
    }
    initializationMarker(db) {
      let marker;
      if (db.exec(`SELECT 1 FROM sqlite_master WHERE type='table' AND name='${META2}'`).length) {
        const rows = db.exec(`SELECT value FROM ${META2} WHERE key='identity'`)[0]?.values;
        if (rows?.length) {
          marker = JSON.parse(String(rows[0][0]));
          if (!marker || typeof marker !== "object")
            throw new Error("数据库身份内容无效。");
        }
      }
      if (marker && (!["char", "chat"].includes(marker.scope) || typeof marker.charDbId !== "string" || !marker.charDbId || marker.scope === "chat" && (typeof marker.chatDbId !== "string" || !marker.chatDbId)))
        throw new Error("数据库身份字段无效。");
      return marker;
    }
    storeInitialization(db, identity) {
      if (identity && (!["char", "chat"].includes(identity.scope) || !identity.charDbId || identity.scope === "chat" && !identity.chatDbId))
        throw new Error("数据库身份字段无效。");
      if (identity) {
        db.run(SCOPED_META_TABLE_SQL);
        db.run(`INSERT OR REPLACE INTO ${META2} VALUES ('identity', ?)`, [JSON.stringify(identity)]);
      }
    }
    transaction(commands, onComplete = () => {}, hooks = {}) {
      const snapshot = structuredClone(commands), initialization = hooks.initialization && structuredClone(hooks.initialization), management = hooks.management === true;
      return this.enqueue(async () => {
        let db;
        const firstCommit = this.transient && !this.initializationCommitted;
        try {
          db = this.ready();
          if (firstCommit && !initialization)
            throw new ServiceError({
              code: "INVALID_REQUEST",
              failureKind: "request-rejected",
              message: "首次提交必须提供数据库身份。"
            });
          if (initialization && !firstCommit)
            throw new ServiceError({
              code: "INVALID_REQUEST",
              failureKind: "request-rejected",
              message: "已有内存数据库不能重复初始化。"
            });
          if (this.storage.assertExisting && !this.transient)
            await this.checkFile();
          hooks.beforeExecute?.();
        } catch (error) {
          throw new ServiceError({
            ...errorData(error),
            executionState: "not-started",
            businessResult: "not-started",
            databasePersisted: undefined
          });
        }
        let started = false;
        let phase = "begin";
        try {
          db.run("BEGIN TRANSACTION");
          started = true;
          phase = "identity";
          this.storeInitialization(db, initialization);
          phase = "command";
          for (const command of snapshot)
            this.executeCommand(db, command);
          phase = "commit";
          db.run("COMMIT");
        } catch (sqlError) {
          const original = errorData(sqlError), failureKind = management ? "service" : phase === "command" && sqlError instanceof ServiceError ? original.failureKind ?? "service" : sqliteFailureKind(sqlError, phase);
          if (!started)
            throw new ServiceError({
              code: "SQL_FAILED",
              message: `事务未开始：${detail(sqlError).message}`,
              failureKind,
              executionState: "not-started",
              sqlError: detail(sqlError),
              businessResult: "not-started"
            });
          try {
            db.run("ROLLBACK");
          } catch (rollbackError) {
            this.disable();
            throw new ServiceError({
              code: "ROLLBACK_FAILED",
              failureKind,
              executionState: management ? "not-started" : "unknown",
              resultState: "unconfirmed",
              message: `SQL 失败且回滚失败，无法确认事务结果，实例已停用：${detail(sqlError).message}`,
              sqlError: original.sqlError ?? detail(sqlError),
              rollbackError: detail(rollbackError),
              businessResult: management ? "not-started" : "unknown"
            });
          }
          if (firstCommit)
            this.disable();
          throw new ServiceError({
            ...sqlError instanceof ServiceError ? original : {
              code: "SQL_FAILED",
              message: `SQL 执行失败，事务已回滚：${detail(sqlError).message}`,
              sqlError: detail(sqlError)
            },
            failureKind,
            executionState: management ? "not-started" : "rolled-back",
            businessResult: management ? "not-started" : "not-saved",
            databasePersisted: undefined
          });
        }
        this.dirty = true;
        if (firstCommit) {
          this.initializationCommitted = true;
          this.firstSaveHooks = { beforeSave: hooks.beforeSave, afterSave: hooks.afterSave };
        }
        if (management) {
          try {
            await this.persist(db, this.transient, true);
          } catch (error) {
            throw new ServiceError({ ...errorData(error), executionState: "not-started", databasePersisted: undefined });
          }
          this.dirty = false;
          this.cancelPendingSave();
          try {
            onComplete();
          } catch (error) {
            throw new ServiceError({
              ...errorData(error),
              businessResult: "not-started",
              executionState: "not-started",
              databasePersisted: undefined
            });
          }
          return { persisted: true };
        }
        this.markUnsaved(true);
        this.scheduleSave();
        try {
          onComplete();
        } catch (error) {
          throw new ServiceError({
            ...errorData(error),
            executionState: "committed",
            businessResult: undefined,
            databasePersisted: undefined
          });
        }
        return { committed: true, persisted: false };
      });
    }
    executeCommand(db, command) {
      if (command.mode === "runSql") {
        db.run(command.sql);
        return;
      }
      if (command.mode === "exec") {
        checkPrefix(command.sql, "exec");
        let remaining = command.sql;
        while ((remaining = skipHead(remaining, true)).length) {
          checkPrefix(remaining, "exec");
          const stmt = db.prepare(remaining);
          let failed = false;
          try {
            remaining = remaining.slice(stmt.getSQL().length);
            while (stmt.step()) {}
          } catch (error) {
            failed = true;
            throw error;
          } finally {
            try {
              stmt.free();
            } catch (error) {
              if (!failed)
                throw error;
            }
          }
        }
        return;
      }
      if (command.expectChanges !== undefined) {
        if (!Number.isSafeInteger(command.expectChanges) || command.expectChanges < 0 || command.kind !== "write")
          throw new ServiceError({
            code: "INVALID_REQUEST",
            failureKind: "request-rejected",
            message: "影响行数检查参数无效。"
          });
        checkPrefix(command.sql, "update");
      }
      const stmt = command.kind === "check" ? prepareQuery(db, command.sql) : command.kind === "write" ? prepareSingle(db, command.sql, "transaction") : command.mode ? prepareSingle(db, command.sql, command.mode) : db.prepare(command.sql);
      let failed = false;
      try {
        if (command.binds) {
          try {
            stmt.bind(command.binds);
          } catch (error) {
            throw new ServiceError({
              code: "SQL_FAILED",
              failureKind: sqliteFailureKind(error, "binding"),
              message: `绑定参数失败：${detail(error).message}`,
              sqlError: detail(error)
            });
          }
        }
        if (command.kind === "check") {
          if (stmt.getColumnNames().length !== 1 || !stmt.step() || stmt.get()[0] !== 1 || stmt.step())
            throw new ServiceError({
              code: "SQL_FAILED",
              failureKind: "precondition-rejected",
              message: "事务检查条件未通过，必须返回恰好一行一列且数值为 1。"
            });
        } else {
          while (stmt.step()) {}
          if (command.expectChanges !== undefined && db.getRowsModified() !== command.expectChanges)
            throw new ServiceError({
              code: "SQL_FAILED",
              failureKind: "precondition-rejected",
              message: `事务写入影响行数与要求的 ${command.expectChanges} 行不符。`
            });
        }
      } catch (error) {
        failed = true;
        throw error;
      } finally {
        try {
          stmt.free();
        } catch (error) {
          if (!failed)
            throw error;
        }
      }
    }
    query(command, beforeExecute) {
      const snapshot = structuredClone(command);
      return this.enqueue(async () => {
        const db = this.ready();
        if (this.storage.assertExisting && !this.transient)
          await this.checkFile();
        beforeExecute?.();
        try {
          const stmt = prepareQuery(db, snapshot.sql);
          let failed = false;
          try {
            if (snapshot.binds) {
              try {
                stmt.bind(snapshot.binds);
              } catch (error) {
                throw new ServiceError({
                  code: "SQL_FAILED",
                  failureKind: sqliteFailureKind(error, "binding"),
                  message: `查询参数绑定失败：${detail(error).message}`,
                  sqlError: detail(error)
                });
              }
            }
            const columns = stmt.getColumnNames();
            const rows = [];
            while (stmt.step())
              rows.push(stmt.get().map((value) => value instanceof Uint8Array ? value.slice() : value));
            return { columns, rows };
          } catch (error) {
            failed = true;
            throw error;
          } finally {
            try {
              stmt.free();
            } catch (error) {
              if (!failed)
                throw error;
            }
          }
        } catch (error) {
          if (error instanceof ServiceError)
            throw error;
          throw new ServiceError({
            code: "SQL_FAILED",
            failureKind: "service",
            message: `执行查询失败：${detail(error).message}；请检查 SQL、参数和表结构。`,
            sqlError: detail(error)
          });
        }
      });
    }
    viewer(request, beforeExecute) {
      if (!request || typeof request !== "object" || !["tables", "table", "ddl", "detail", "file"].includes(request.operation))
        return Promise.reject(new ServiceError({ code: "INVALID_REQUEST", message: "不支持的数据库查看操作。" }));
      const snapshot = structuredClone(request);
      return this.enqueue(async () => {
        const db = this.ready();
        await this.checkFile();
        beforeExecute?.();
        if (snapshot.operation === "file") {
          if (this.transient)
            throw new ServiceError({
              code: "DATABASE_NOT_INITIALIZED",
              failureKind: "service",
              message: "内存数据库可用，但数据库文件尚未创建，没有可显示的文件大小或保存时间。"
            });
          if (!this.storage.metadata)
            throw new ServiceError({ code: "UNSUPPORTED_ENVIRONMENT", message: "当前存储未提供实际文件信息。" });
          try {
            return await this.storage.metadata();
          } catch (error) {
            if (error instanceof ServiceError)
              throw error;
            throw new ServiceError({
              code: "LOAD_FAILED",
              message: `无法读取数据库的实际文件信息：${detail(error).message}`,
              causeError: detail(error),
              retryable: fileRetryable(error)
            });
          }
        }
        try {
          return readViewer(db, snapshot);
        } catch (error) {
          if (error instanceof ServiceError)
            throw error;
          throw new ServiceError({
            code: "SQL_FAILED",
            message: `数据库查看查询失败：${detail(error).message}`,
            sqlError: detail(error)
          });
        }
      });
    }
  }

  // src/storage-database.ts
  var connection;
  function openStorageDatabase() {
    return connection ??= new Promise((resolve, reject) => {
      const request = indexedDB.open("st-sqlite-helper-storage", 2);
      let rejected = false;
      const fail = (error) => {
        rejected = true;
        reject(new ServiceError({
          code: "CONFIG_FAILED",
          message: "无法打开本地存储设置，请查看详情。",
          causeError: detail(error)
        }));
      };
      request.onupgradeneeded = () => {
        for (const name of ["configuration", "files"])
          if (!request.result.objectStoreNames.contains(name))
            request.result.createObjectStore(name);
      };
      request.onerror = () => fail(request.error);
      request.onblocked = () => fail("本地存储升级被旧页面阻塞，请关闭其他旧页面后刷新。");
      request.onsuccess = () => {
        const db = request.result;
        if (rejected) {
          db.close();
          return;
        }
        db.onversionchange = () => {
          db.close();
          connection = undefined;
        };
        resolve(db);
      };
    }).catch((error) => {
      connection = undefined;
      throw error;
    });
  }

  // src/worker/storage.ts
  var PROBE_FILE_PREFIX = "__st_sqlite_helper_probe__/";
  var indexedDbSource = (source) => ("mode" in source) && source.mode === "indexeddb";
  function storageDirectory(source) {
    if ("storageId" in source) {
      if (source.mode === "indexeddb")
        throw new Error("IndexedDB 存储没有目录句柄。");
      return source.directory;
    }
    return source;
  }
  var storageName = (source) => indexedDbSource(source) ? "IndexedDB" : storageDirectory(source).name;
  async function filesTransaction(mode, operation) {
    const db = await openStorageDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("files", mode);
      let value;
      tx.oncomplete = () => resolve(value);
      tx.onabort = () => reject(tx.error ?? new Error("IndexedDB 文件事务失败。"));
      operation(tx.objectStore("files"), (result) => {
        value = result;
      });
    });
  }
  function indexedDbFileKeys() {
    return filesTransaction("readonly", (store, result) => {
      const keys = [];
      const request = store.openKeyCursor();
      request.onsuccess = () => {
        const cursor = request.result;
        if (!cursor)
          return result(keys);
        if (typeof cursor.key === "string" && !cursor.key.startsWith(PROBE_FILE_PREFIX))
          keys.push(cursor.key);
        cursor.continue();
      };
    });
  }
  async function indexedDbRecord(path) {
    const entry = await filesTransaction("readonly", (store, result) => {
      const request = store.openCursor(path);
      request.onsuccess = () => result(request.result ? { value: request.result.value } : undefined);
    });
    if (entry === undefined)
      return;
    const value = entry.value;
    if (value === null || typeof value !== "object" || !("bytes" in value) || !(value.bytes instanceof Uint8Array) || !("lastModified" in value) || typeof value.lastModified !== "number" || !Number.isFinite(value.lastModified))
      throw new Error("IndexedDB 数据库文件记录格式无效，原文件未被替换。");
    return { bytes: value.bytes, lastModified: value.lastModified };
  }
  async function writeIndexedDbFile(path, bytes, create) {
    const record = { bytes: bytes.slice(), lastModified: Date.now() };
    if (create)
      return filesTransaction("readwrite", (store) => {
        store.put(record, path);
      });
    let missing = false;
    await filesTransaction("readwrite", (store) => {
      const request = store.getKey(path);
      request.onsuccess = () => {
        if (request.result === undefined)
          missing = true;
        else
          store.put(record, path);
      };
    });
    if (missing)
      throw new DOMException("数据库文件不存在。", "NotFoundError");
  }
  function deleteIndexedDbFile(path) {
    return filesTransaction("readwrite", (store) => {
      store.delete(path);
    });
  }
  async function readStorageFile(source, path) {
    if (indexedDbSource(source)) {
      const record = await indexedDbRecord(path);
      if (record === undefined)
        throw new DOMException("数据库文件不存在。", "NotFoundError");
      return { relativePath: path, size: record.bytes.length, lastModified: record.lastModified, bytes: record.bytes };
    }
    let parent = storageDirectory(source);
    const parts = path.split("/");
    for (const part of parts.slice(0, -1))
      parent = await parent.getDirectoryHandle(part, { create: false });
    const file = await (await parent.getFileHandle(parts.at(-1), { create: false })).getFile();
    return {
      relativePath: path,
      size: file.size,
      lastModified: file.lastModified,
      bytes: new Uint8Array(await file.arrayBuffer())
    };
  }
  async function storageEntryExists(source, path, kind) {
    if (indexedDbSource(source)) {
      if (kind === "directory")
        return (await indexedDbFileKeys()).some((key) => key.startsWith(`${path}/`));
      return filesTransaction("readonly", (store, result) => {
        const request = store.getKey(path);
        request.onsuccess = () => result(request.result !== undefined);
      });
    }
    try {
      let directory = storageDirectory(source);
      const parts = path.split("/");
      if (kind === "directory") {
        for (const part of parts)
          directory = await directory.getDirectoryHandle(part, { create: false });
        for await (const _entry of directory.entries())
          return true;
        return false;
      }
      for (const part of parts.slice(0, -1))
        directory = await directory.getDirectoryHandle(part, { create: false });
      await (await directory.getFileHandle(parts.at(-1), { create: false })).getFile();
      return true;
    } catch (error) {
      if (error instanceof DOMException && error.name === "NotFoundError")
        return false;
      throw error;
    }
  }

  class IndexedDbStorage {
    charDbId;
    chatDbId;
    path;
    constructor(charDbId, chatDbId) {
      this.charDbId = charDbId;
      this.chatDbId = chatDbId;
      this.path = databasePath(charDbId, chatDbId);
    }
    async readSnapshot() {
      const record = await indexedDbRecord(this.path);
      if (record === undefined)
        return { bytes: null };
      return {
        bytes: record.bytes,
        metadata: {
          directoryName: "IndexedDB",
          name: this.path.split("/").at(-1),
          size: record.bytes.length,
          lastModified: record.lastModified,
          relativePath: this.path
        }
      };
    }
    async read() {
      return (await this.readSnapshot()).bytes;
    }
    async metadata() {
      const file = await this.readSnapshot();
      if (!file.metadata)
        throw new DOMException("数据库文件不存在。", "NotFoundError");
      return file.metadata;
    }
    async assertExisting() {
      if (!(await this.metadata()).size)
        throw new Error("已有数据库文件为空。");
    }
    write(bytes, options = {}) {
      return writeIndexedDbFile(this.path, bytes, options.create === true);
    }
    async remove() {
      if (!isUuid(this.charDbId) || this.chatDbId !== undefined && !isUuid(this.chatDbId))
        throw new ServiceError({
          code: "INVALID_REQUEST",
          message: "文件清理必须指定有效的角色或聊天 UUID，不能删除 root。"
        });
      await deleteIndexedDbFile(this.path);
      if (await storageEntryExists({ storageId: "", mode: "indexeddb" }, this.path, "file"))
        throw new ServiceError({
          code: "RESULT_UNCONFIRMED",
          resultState: "unconfirmed",
          message: "文件删除后仍存在，清理结果尚未确认。"
        });
    }
  }
  function createStorage(source, charDbId, chatDbId, opfs = false) {
    return indexedDbSource(source) ? new IndexedDbStorage(charDbId, chatDbId) : new DirectoryStorage(storageDirectory(source), charDbId, chatDbId, opfs || "mode" in source && source.mode === "opfs");
  }
  async function directoryPermission(directory) {
    if (!("queryPermission" in directory))
      return "granted";
    return directory.queryPermission({ mode: "readwrite" });
  }
  async function opfsDirectory() {
    if (typeof navigator === "undefined" || typeof navigator.storage?.getDirectory !== "function")
      throw new ServiceError({
        code: "UNSUPPORTED_ENVIRONMENT",
        message: "当前浏览器没有可用的 OPFS，游玩模式无法启动。"
      });
    if (typeof FileSystemFileHandle === "undefined" || typeof FileSystemFileHandle.prototype.createWritable !== "function")
      throw new ServiceError({
        code: "UNSUPPORTED_ENVIRONMENT",
        message: "当前浏览器未提供 OPFS 异步文件写入接口，游玩模式无法启动。"
      });
    try {
      return await (await navigator.storage.getDirectory()).getDirectoryHandle("st-sqlite-helper", { create: true });
    } catch (error) {
      throw new ServiceError({
        code: "LOAD_FAILED",
        message: `无法取得游玩模式的浏览器存储：${errorData(error).message}`
      });
    }
  }

  class DirectoryStorage {
    directory;
    charDbId;
    chatDbId;
    opfs;
    constructor(directory, charDbId, chatDbId, opfs = false) {
      this.directory = directory;
      this.charDbId = charDbId;
      this.chatDbId = chatDbId;
      this.opfs = opfs;
    }
    async target(create) {
      let directory = this.directory;
      for (const name of databaseLocation(this.charDbId, this.chatDbId).directories)
        directory = await directory.getDirectoryHandle(name, { create });
      return directory;
    }
    filename() {
      return databaseLocation(this.charDbId, this.chatDbId).file;
    }
    async metadata() {
      await this.permission();
      const file = await (await (await this.target(false)).getFileHandle(this.filename(), { create: false })).getFile();
      return {
        directoryName: this.directory.name,
        name: file.name,
        size: file.size,
        lastModified: file.lastModified,
        relativePath: databasePath(this.charDbId, this.chatDbId)
      };
    }
    async remove() {
      if (!isUuid(this.charDbId) || this.chatDbId !== undefined && !isUuid(this.chatDbId))
        throw new ServiceError({
          code: "INVALID_REQUEST",
          message: "文件清理必须指定有效的角色或聊天 UUID，不能删除 root。"
        });
      await this.permission();
      let directory;
      try {
        directory = await this.target(false);
      } catch (error) {
        if (error instanceof DOMException && error.name === "NotFoundError")
          return;
        throw error;
      }
      try {
        await directory.removeEntry(this.filename());
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "NotFoundError"))
          throw error;
      }
      try {
        await directory.getFileHandle(this.filename(), { create: false });
      } catch (error) {
        if (error instanceof DOMException && error.name === "NotFoundError")
          return;
        throw error;
      }
      throw new ServiceError({
        code: "RESULT_UNCONFIRMED",
        resultState: "unconfirmed",
        message: "文件删除后仍存在，清理结果尚未确认。"
      });
    }
    async permission() {
      if (this.opfs)
        return;
      if (await directoryPermission(this.directory) !== "granted")
        throw new ServiceError({ code: "PERMISSION_REQUIRED", message: "请在页面点击重新授权目录，再从文件恢复。" });
    }
    async read() {
      return (await this.readSnapshot()).bytes;
    }
    async readSnapshot() {
      await this.permission();
      let file;
      try {
        file = await (await this.target(false)).getFileHandle(this.filename());
      } catch (error) {
        if (error instanceof DOMException && error.name === "NotFoundError")
          return { bytes: null };
        throw error;
      }
      const current = await file.getFile();
      return {
        bytes: new Uint8Array(await current.arrayBuffer()),
        metadata: {
          directoryName: this.directory.name,
          name: current.name,
          size: current.size,
          lastModified: current.lastModified,
          relativePath: databasePath(this.charDbId, this.chatDbId)
        }
      };
    }
    async assertExisting() {
      await this.permission();
      const file = await (await this.target(false)).getFileHandle(this.filename(), { create: false });
      if ((await file.getFile()).size === 0)
        throw new Error("已有数据库文件为空。");
    }
    async write(bytes, options = {}) {
      await this.permission();
      const create = options.create === true;
      const file = await (await this.target(create)).getFileHandle(this.filename(), { create });
      const writer = await file.createWritable();
      try {
        await writer.write(bytes);
        await writer.close();
      } catch (error) {
        try {
          await writer.abort();
        } catch {}
        throw error;
      }
    }
  }
  var domError = (error, name) => error instanceof DOMException && error.name === name;
  async function removeStorageEntry(source, segments, kind) {
    if (indexedDbSource(source)) {
      const path = segments.join("/");
      if (kind === "directory")
        return await storageEntryExists(source, path, kind) ? "not-empty" : "missing";
      if (!await storageEntryExists(source, path, kind))
        return "missing";
      await deleteIndexedDbFile(path);
      if (await storageEntryExists(source, path, kind))
        throw new ServiceError({
          code: "RESULT_UNCONFIRMED",
          resultState: "unconfirmed",
          message: "条目删除后仍存在，删除结果尚未确认。"
        });
      return "removed";
    }
    const directory = storageDirectory(source);
    let parent = directory;
    try {
      for (const segment of segments.slice(0, -1))
        parent = await parent.getDirectoryHandle(segment, { create: false });
    } catch (error) {
      if (domError(error, "NotFoundError"))
        return "missing";
      throw error;
    }
    const name = segments.at(-1);
    const open = () => kind === "file" ? parent.getFileHandle(name, { create: false }) : parent.getDirectoryHandle(name, { create: false });
    try {
      await open();
    } catch (error) {
      if (domError(error, "NotFoundError"))
        return "missing";
      if (domError(error, "TypeMismatchError"))
        throw new ServiceError({ code: "INVALID_REQUEST", message: "这个位置的条目类型已与扫描结果不同，未删除。" });
      throw error;
    }
    try {
      await parent.removeEntry(name);
    } catch (error) {
      if (domError(error, "InvalidModificationError"))
        return "not-empty";
      if (!domError(error, "NotFoundError"))
        throw error;
    }
    try {
      await open();
    } catch (error) {
      if (domError(error, "NotFoundError"))
        return "removed";
      throw error;
    }
    throw new ServiceError({
      code: "RESULT_UNCONFIRMED",
      resultState: "unconfirmed",
      message: "条目删除后仍存在，删除结果尚未确认。"
    });
  }

  // src/worker/configuration-repository.ts
  function validateConfiguration(value) {
    const handle = (h) => h?.kind === "directory" && typeof h.getFileHandle === "function" && typeof h.isSameEntry === "function";
    const space = (s) => !!s && typeof s.storageId === "string" && !!s.storageId && (s.mode === "indexeddb" ? s.directory === undefined : (s.mode === undefined || s.mode === "opfs" || s.mode === "directory") && handle(s.directory));
    if (!value || !space(value) || typeof value.storageId !== "string" || !value.storageId || !Number.isSafeInteger(value.configGeneration) || value.configGeneration < 1 || !Array.isArray(value.spaces) || value.spaces.length === 0 || value.mode !== undefined && !["opfs", "directory", "indexeddb"].includes(value.mode) || value.autoReloadEnabled !== undefined && typeof value.autoReloadEnabled !== "boolean" || value.spaces.some((s) => !space(s)) || value.savedDirectory !== undefined && (!handle(value.savedDirectory.directory) || (value.savedDirectory.mode ?? "directory") !== "directory" || !value.spaces.some((s) => s.storageId === value.savedDirectory.storageId && (s.mode ?? "directory") === "directory")) || new Set(value.spaces.map((s) => s.storageId)).size !== value.spaces.length || !value.spaces.some((s) => s.storageId === value.storageId)) {
      throw new ServiceError({ code: "CONFIG_FAILED", message: "已保存目录配置无效，拒绝静默替换存储身份。" });
    }
  }
  var failed = (error) => new ServiceError({
    code: "CONFIG_FAILED",
    message: `读取或保存 IndexedDB 目录配置失败：${detail(error).message}`,
    causeError: detail(error)
  });

  class IndexedDbConfiguration {
    async read() {
      try {
        const db = await openStorageDatabase();
        return await new Promise((resolve, reject) => {
          const transaction = db.transaction("configuration", "readonly");
          const request = transaction.objectStore("configuration").get("current");
          let result = null;
          request.onsuccess = () => {
            result = request.result ?? null;
          };
          transaction.oncomplete = () => resolve(result);
          transaction.onabort = () => reject(transaction.error ?? request.error);
          transaction.onerror = () => {};
        });
      } catch (error) {
        throw failed(error);
      }
    }
    async write(configuration) {
      try {
        const db = await openStorageDatabase();
        await new Promise((resolve, reject) => {
          const transaction = db.transaction("configuration", "readwrite");
          const request = transaction.objectStore("configuration").put(configuration, "current");
          transaction.oncomplete = () => resolve();
          transaction.onabort = () => reject(transaction.error ?? request.error);
          transaction.onerror = () => {};
        });
      } catch (error) {
        throw failed(error);
      }
    }
  }

  // src/worker/write-errors.ts
  var invalidRequest = () => {
    throw new ServiceError({
      code: "INVALID_REQUEST",
      failureKind: "request-rejected",
      message: "请求字段或操作类型无效。"
    });
  };
  function beforeBusinessSqlError(error) {
    const data = errorData(error);
    return new ServiceError({
      ...data,
      failureKind: data.failureKind ?? "service",
      executionState: "not-started",
      businessResult: "not-started",
      databasePersisted: undefined,
      resultState: "not-applied",
      retryable: false
    });
  }

  // src/worker/target-lifecycle.ts
  var rootInitializations = new WeakMap;
  var key = (b) => [b.scope, b.charDbId, b.chatDbId ?? ""];
  var failed2 = (message) => new ServiceError({ code: "LOAD_FAILED", message });
  var notInitialized = (b) => new ServiceError({
    code: "DATABASE_NOT_INITIALIZED",
    message: `${b.scope === "chat" ? "聊天" : "角色"}数据库尚未创建，请先由业务写入。`,
    databaseScope: b.scope,
    resultKind: "database"
  });

  class RootTargets {
    root;
    readOnly;
    initialized = false;
    constructor(root, readOnly = false) {
      this.root = root;
      this.readOnly = readOnly;
    }
    invalidate() {
      this.initialized = false;
    }
    async validateExisting() {
      const names = (await this.root.query({
        sql: "SELECT name FROM sqlite_master WHERE name GLOB '__stsh_*' OR name GLOB '__st_sle_helper_*'"
      })).rows.map((row) => String(row[0]));
      if (names.some((name) => name.startsWith("__st_sle_helper_")))
        throw failed2("数据库包含已停止支持的旧管理结构，请使用当前结构的数据文件。");
      if (names.length)
        await assertSchema6(this.root);
    }
    async hasManagement() {
      if (this.root.availability !== "ready") {
        this.initialized = false;
        await this.root.refresh();
      }
      await this.root.assertFileExisting();
      return (await this.root.query({
        sql: "SELECT 1 FROM sqlite_master WHERE name GLOB '__stsh_*' OR name GLOB '__st_sle_helper_*' LIMIT 1"
      })).rows.length > 0;
    }
    async ready() {
      if (this.root.availability !== "ready") {
        this.initialized = false;
        await this.root.refresh();
      }
      await this.root.assertFileExisting();
      if (this.initialized)
        return;
      if (this.readOnly) {
        await assertSchema6(this.root);
        this.initialized = true;
        return;
      }
      let pending = rootInitializations.get(this.root);
      if (!pending) {
        pending = this.initialize().finally(() => rootInitializations.delete(this.root));
        rootInitializations.set(this.root, pending);
      }
      await pending;
      this.initialized = true;
    }
    async initialize() {
      if ((await this.root.query({ sql: "SELECT name FROM sqlite_master WHERE name GLOB '__st_sle_helper_*'" })).rows.length)
        throw failed2("数据库包含已停止支持的旧管理结构，请使用当前结构的数据文件。");
      const known = [META, TARGETS, ROLES, CHATS];
      const rows = (await this.root.query({
        sql: `SELECT name,type FROM sqlite_master WHERE name IN (${known.map(() => "?").join(",")})`,
        binds: known
      })).rows;
      if (rows.some((r) => r[1] !== "table"))
        throw failed2("管理表被其他 SQLite 对象替代。");
      const names = rows.map((r) => String(r[0]));
      if (!names.length)
        await this.root.transaction([...SCHEMA6.map((sql) => ({ sql })), { sql: `INSERT INTO ${META} VALUES('schema_version','6')` }], undefined, { management: true });
      else if (known.some((name) => !names.includes(name)))
        throw failed2("管理结构不完整，拒绝补造记录。");
      await assertSchema6(this.root);
    }
    async read(binding) {
      await this.ready();
      const row = (await this.root.query({
        sql: `SELECT origin,state FROM ${TARGETS} WHERE scope=? AND char_dbid=? AND chat_dbid=?`,
        binds: key(binding)
      })).rows[0];
      if (!row)
        return;
      if (!["generated", "legacy"].includes(String(row[0])) || !["never", "creating", "ready"].includes(String(row[1])))
        throw failed2("目标创建记录无效。");
      return { origin: row[0], state: row[1] };
    }
    async generatedCommands(binding) {
      const old = await this.read(binding);
      if (old) {
        if (old.origin !== "generated")
          throw failed2("新编号与旧数据库冲突。");
        return [];
      }
      return [{ sql: `INSERT INTO ${TARGETS} VALUES(?,?,?,'generated','never')`, binds: key(binding) }];
    }
    async registerGenerated(binding) {
      const commands = await this.generatedCommands(binding);
      if (commands.length)
        await this.root.transaction(commands, undefined, { management: true });
    }
    async legacy(binding) {
      await this.root.transaction([{ sql: `INSERT INTO ${TARGETS} VALUES(?,?,?,'legacy','ready')`, binds: key(binding) }], undefined, { management: true });
    }
    async transition(binding, previous, state) {
      await this.ready();
      await this.root.transaction([
        {
          sql: `UPDATE ${TARGETS} SET state=? WHERE scope=? AND char_dbid=? AND chat_dbid=? AND state=? AND origin=?`,
          binds: [state, ...key(binding), previous.state, previous.origin]
        }
      ], undefined, { management: true });
      const actual = await this.read(binding);
      if (actual?.state !== state || actual.origin !== previous.origin)
        throw failed2("目标状态已改变，未继续保存。");
    }
  }

  class TargetLifecycle {
    binding;
    db;
    targets;
    loaded = false;
    memoryCommitted = false;
    constructor(binding, db, targets) {
      this.binding = binding;
      this.db = db;
      this.targets = targets;
    }
    marker() {
      return {
        scope: this.binding.scope,
        charDbId: this.binding.charDbId,
        ...this.binding.chatDbId ? { chatDbId: this.binding.chatDbId } : {}
      };
    }
    async identity(required) {
      const actual = await this.db.getInitializationMarker(), expected = this.marker();
      if (!actual && !required)
        return;
      if (!actual || actual.scope !== expected.scope || actual.charDbId !== expected.charDbId || actual.chatDbId !== expected.chatDbId)
        throw failed2("数据库文件身份与固定目标不符，拒绝访问。");
    }
    async openAndVerify(required) {
      try {
        await this.db.openExisting();
        await this.identity(required);
        this.loaded = true;
      } catch (error) {
        this.loaded = false;
        try {
          await this.db.close();
        } catch {}
        throw error;
      }
    }
    async resolve() {
      if (this.memoryCommitted && this.loaded && this.db.availability === "ready") {
        if (!this.db.hasPendingFirstCommit)
          await this.db.assertFileExisting();
        return { origin: "generated", state: "ready" };
      }
      let record = await this.targets.read(this.binding);
      if (!record) {
        if (!await this.db.fileExists())
          throw failed2("已有编号没有登记且文件缺失，不能建立空库替代。");
        await this.openAndVerify(false);
        await this.targets.legacy(this.binding);
        return { origin: "legacy", state: "ready" };
      }
      if (record.state === "never") {
        if (await this.db.fileExists())
          throw failed2("目标尚未创建但已有同名文件，拒绝覆盖。");
        return record;
      }
      if (!this.loaded || this.db.availability !== "ready") {
        await this.openAndVerify(record.origin === "generated");
      } else
        await this.db.assertFileExisting();
      if (record.state === "creating") {
        await this.targets.transition(this.binding, record, "ready");
        record = { ...record, state: "ready" };
      }
      return record;
    }
    async read(task) {
      const record = await this.resolve();
      if (record.state !== "ready")
        throw notInitialized(this.binding);
      return task(this.db);
    }
    async refresh(onlyChanged = false) {
      const record = await this.resolve();
      if (record.state !== "ready")
        throw notInitialized(this.binding);
      const changed = onlyChanged ? await this.db.refreshIfChanged() : (await this.db.refresh(), true);
      if (changed) {
        this.memoryCommitted = false;
        try {
          await this.identity(record.origin === "generated");
        } catch (error) {
          await this.db.close();
          this.loaded = false;
          throw error;
        }
      }
      return changed;
    }
    async inspect(task, targets) {
      if (this.memoryCommitted && this.loaded && this.db.availability === "ready") {
        return task(this.db);
      }
      const record = await targets.read(this.binding);
      if (!record)
        throw failed2("目标没有已有记录；查看不会登记或创建库。");
      if (record.state === "never")
        throw notInitialized(this.binding);
      if (record.state !== "ready")
        throw new ServiceError({
          code: "RESULT_UNCONFIRMED",
          resultState: "unconfirmed",
          message: "数据库首次保存尚未完成核对；查看不会改变创建状态。"
        });
      if (!this.loaded || this.db.availability !== "ready")
        await this.openAndVerify(record.origin === "generated");
      return task(this.db);
    }
    async write(commands, callId, onCommitted, beforeExecute) {
      let record;
      try {
        record = await this.resolve();
        if (record.state !== "ready") {
          await this.db.openTransient();
          this.loaded = true;
        }
      } catch (error) {
        throw beforeBusinessSqlError(error);
      }
      if (record.state === "ready")
        return this.db.transaction(commands, () => onCommitted?.(callId), { beforeExecute });
      try {
        const result = await this.db.transaction(commands, () => {
          this.memoryCommitted = true;
          onCommitted?.(callId);
        }, {
          beforeExecute,
          initialization: this.marker(),
          beforeSave: async () => {
            const current = await this.targets.read(this.binding);
            if (current?.origin === record.origin && (current.state === "creating" || current.state === "ready"))
              return;
            await this.targets.transition(this.binding, record, "creating");
          },
          afterSave: () => this.targets.transition(this.binding, { ...record, state: "creating" }, "ready")
        });
        return result;
      } catch (error) {
        if (!this.memoryCommitted || this.db.availability !== "ready")
          this.loaded = false;
        throw error;
      }
    }
  }

  // src/core/binds.ts
  var invalid3 = (reason) => {
    throw new ServiceError({
      code: "INVALID_REQUEST",
      message: `绑定参数无效：${reason}`,
      failureKind: "request-rejected"
    });
  };
  function nativePrototype(prototype, constructor) {
    const descriptor = Object.getOwnPropertyDescriptor(prototype, "constructor");
    return !!descriptor && "value" in descriptor && typeof descriptor.value === "function" && Object.getOwnPropertyDescriptor(descriptor.value, "prototype")?.value === prototype && Function.prototype.toString.call(descriptor.value) === Function.prototype.toString.call(constructor);
  }
  function plain(value) {
    const prototype = Object.getPrototypeOf(value);
    return prototype === null || Object.getPrototypeOf(prototype) === null && nativePrototype(prototype, Object);
  }
  function ordinaryArray(value) {
    const prototype = Object.getPrototypeOf(value);
    return prototype !== null && Array.isArray(prototype) && plain(prototype) && nativePrototype(prototype, Array);
  }
  var typedArrayName = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(Uint8Array.prototype), Symbol.toStringTag).get;
  function entries(value) {
    if (!Array.isArray(value) && !plain(value))
      return invalid3("只接受数组和普通对象。");
    if (Array.isArray(value) && !ordinaryArray(value))
      return invalid3("不接受数组类实例或自定义原型。");
    const descriptors = Object.getOwnPropertyDescriptors(value);
    if (Object.getOwnPropertySymbols(value).length)
      return invalid3("不接受 symbol 属性。");
    const result = [];
    for (const [key, descriptor] of Object.entries(descriptors)) {
      if (Array.isArray(value) && key === "length")
        continue;
      if (!("value" in descriptor) || !descriptor.enumerable)
        return invalid3("不接受访问器或隐藏属性。");
      if (Array.isArray(value) && (!/^(0|[1-9]\d*)$/.test(key) || Number(key) >= value.length))
        return invalid3("数组不能包含额外属性。");
      result.push([key, descriptor.value]);
    }
    if (Array.isArray(value) && result.length !== value.length)
      return invalid3("数组不能包含空位。");
    return result;
  }
  function jsonSnapshot(value, ancestors) {
    if (value === null || typeof value === "string" || typeof value === "boolean")
      return value;
    if (typeof value === "number")
      return Number.isFinite(value) ? value : invalid3("数值必须有限。");
    if (typeof value !== "object")
      return invalid3("JSON 中包含不支持的值。");
    if (ancestors.has(value))
      return invalid3("JSON 不能循环引用。");
    ancestors.add(value);
    try {
      const properties = entries(value);
      if (Array.isArray(value))
        return properties.map(([, item]) => jsonSnapshot(item, ancestors));
      const result = Object.create(null);
      for (const [key, item] of properties)
        result[key] = jsonSnapshot(item, ancestors);
      return result;
    } finally {
      ancestors.delete(value);
    }
  }
  function scalar(value, allowJson) {
    if (value === null || typeof value === "string")
      return value;
    if (typeof value === "number")
      return Number.isFinite(value) ? value : invalid3("数值必须有限。");
    if (ArrayBuffer.isView(value) && typedArrayName.call(value) === "Uint8Array")
      return new Uint8Array(value);
    if (allowJson && typeof value === "object")
      return JSON.stringify(jsonSnapshot(value, new Set));
    return invalid3(allowJson ? "顶层值只接受 NULL、字符串、有限数值、BLOB 或 JSON 数组/对象。" : "Worker 只接受已序列化的原生值。");
  }
  function capture(input, allowJson) {
    if (input === undefined)
      return;
    if (input === null || typeof input !== "object")
      return invalid3("最外层必须是参数数组或命名参数对象。");
    const properties = entries(input);
    if (Array.isArray(input))
      return properties.map(([, value]) => scalar(value, allowJson));
    const result = Object.create(null);
    for (const [key, value] of properties) {
      if (!/^[:@$].+$/s.test(key))
        return invalid3("命名参数键必须保留 :、@ 或 $ 前缀及参数名。");
      result[key] = scalar(value, allowJson);
    }
    return result;
  }
  function validateSerializedBinds(input) {
    return capture(input, false);
  }

  // src/dvs2/ext/tables/sql.ts
  function quoteIdentifier(value) {
    return `"${value.replaceAll('"', '""')}"`;
  }

  // src/dvs2/ext/tables/schema.ts
  var DVS_VERSION_TABLE_SQL = 'CREATE TABLE IF NOT EXISTS "_dvs_version" (singleton INTEGER PRIMARY KEY CHECK (singleton = 1), version TEXT NOT NULL)';
  var DVS_GC_COUNTER_TABLE_SQL = `CREATE TABLE "_dvs_gc_counter" (singleton INTEGER PRIMARY KEY CHECK (singleton = 1), successful_updates INTEGER NOT NULL CHECK (typeof(successful_updates) = 'integer' AND successful_updates >= 0))`;
  function indexTableName(name) {
    return `_dvs_index_${name}`;
  }
  function createIndexSql(name) {
    return `CREATE TABLE IF NOT EXISTS ${quoteIdentifier(indexTableName(name))} (fid BLOB NOT NULL CHECK (typeof(fid) = 'blob' AND length(fid) = 16), rid BLOB NOT NULL CHECK (typeof(rid) = 'blob' AND length(rid) = 16), PRIMARY KEY (fid,rid)) WITHOUT ROWID`;
  }

  // src/worker/scan.ts
  var missing = (error) => error instanceof DOMException && error.name === "NotFoundError";
  var targetKey = (scope, char, chat) => JSON.stringify([scope, char, chat ?? ""]);
  function assertTarget(charDbId, chatDbId) {
    if (!isUuid(charDbId) || chatDbId !== undefined && !isUuid(chatDbId))
      throw new ServiceError({ code: "INVALID_REQUEST", message: "扫描文件必须指定有效的角色或聊天数据库编号。" });
  }
  async function scanRecords(root, directoryName) {
    const snapshot = {
      directoryName,
      management: "unreadable",
      differences: [],
      rootReadable: false,
      records: [],
      targets: [],
      issues: []
    };
    try {
      if (root.availability !== "ready")
        throw new Error("管理数据库尚未恢复，请先完成现有恢复操作。");
      await root.assertFileExisting();
      const inspection = await inspectSchema6(root);
      if (inspection.state !== "valid") {
        snapshot.management = inspection.state;
        snapshot.differences = inspection.differences;
        return snapshot;
      }
      const query = async (sql) => (await root.query({ sql })).rows;
      const version = Number(JSON.parse(String((await query(`SELECT value FROM ${META} WHERE key='schema_version'`))[0]?.[0])));
      snapshot.schemaVersion = version;
      const targets = await query(`SELECT scope,char_dbid,chat_dbid,origin,state FROM ${TARGETS}`);
      for (const row of targets) {
        const scope = String(row[0]), charDbId = String(row[1]), chatDbId = String(row[2]), origin = String(row[3]), state = String(row[4]);
        if (!["char", "chat"].includes(scope) || !isUuid(charDbId) || (scope === "chat" ? !isUuid(chatDbId) : chatDbId !== "") || !["generated", "legacy"].includes(origin) || !["never", "creating", "ready"].includes(state))
          throw new Error("数据库初始化记录字段无效。");
        snapshot.targets.push({
          scope,
          charDbId,
          ...chatDbId ? { chatDbId } : {},
          origin,
          state
        });
      }
      const initialization = new Map(snapshot.targets.map((target) => [targetKey(target.scope, target.charDbId, target.chatDbId), target.state]));
      const roles = await query(`SELECT role_id,avatar_name,char_dbid,state,generation,confirmed,origin FROM ${ROLES} ORDER BY role_id`);
      const chats = await query(`SELECT chat_id,role_id,file_name,chat_dbid,parent_char_dbid,state,generation,confirmed,origin FROM ${CHATS} ORDER BY chat_id`);
      for (const row of roles)
        snapshot.records.push({
          scope: "char",
          referenceId: Number(row[0]),
          avatar: String(row[1]),
          id: row[2] === null ? null : String(row[2]),
          state: row[3],
          generation: Number(row[4]),
          confirmed: row[5] === 1,
          origin: row[6],
          taskReasons: [],
          parentDependency: chats.some((chat) => chat[1] === row[0] && chat[5] !== "deleted"),
          shared: false
        });
      for (const row of chats) {
        const role = roles.find((role) => role[0] === row[1]);
        if (!role)
          throw new Error("聊天记录缺少对应角色记录。");
        snapshot.records.push({
          scope: "chat",
          referenceId: Number(row[0]),
          parentReferenceId: Number(row[1]),
          avatar: String(role[1]),
          file: String(row[2]),
          id: row[3] === null ? null : String(row[3]),
          parent: String(row[4]),
          state: row[5],
          generation: Number(row[6]),
          confirmed: row[7] === 1,
          origin: row[8],
          taskReasons: [],
          parentDependency: false,
          shared: false
        });
      }
      for (const record of snapshot.records) {
        if (!Number.isSafeInteger(record.referenceId) || record.referenceId < 1 || !record.avatar || record.id !== null && !isUuid(record.id) || record.scope === "chat" && (!isUuid(record.parent) || !record.file) || !["active", "retained", "deleted"].includes(record.state))
          throw new Error("角色或聊天管理记录字段无效。");
        if (record.id)
          record.initialization = initialization.get(targetKey(record.scope, record.scope === "char" ? record.id : record.parent, record.scope === "chat" ? record.id : undefined));
        record.shared = record.id !== null && snapshot.records.some((other) => other !== record && other.scope === record.scope && other.state !== "deleted" && other.id === record.id && other.parent === record.parent);
      }
      snapshot.rootReadable = true;
      snapshot.management = "valid";
    } catch (error) {
      snapshot.management = "unreadable";
      snapshot.rootReadable = false;
      snapshot.records = [];
      snapshot.targets = [];
      snapshot.issues.push({ relativePath: GLOBAL_DATABASE, reason: detail(error).message });
    }
    return snapshot;
  }
  async function readScanBasis(root) {
    const rows = async (sql) => (await root.query({ sql })).rows.map((row) => row.map(String));
    const chats = await rows(`SELECT parent_char_dbid,coalesce(chat_dbid,'') FROM ${CHATS}`);
    return {
      roles: (await rows(`SELECT char_dbid FROM ${ROLES} WHERE char_dbid IS NOT NULL`)).map((row) => row[0]),
      chats: chats.filter((row) => row[1]).map((row) => [row[0], row[1]]),
      chatParents: chats.map((row) => row[0]),
      targets: (await rows(`SELECT scope,char_dbid,chat_dbid FROM ${TARGETS}`)).map(([scope, charDbId, chatDbId]) => ({
        scope,
        charDbId,
        ...chatDbId ? { chatDbId } : {}
      }))
    };
  }
  async function scanFile(directory, charDbId, chatDbId) {
    assertTarget(charDbId, chatDbId);
    const file = {
      charDbId,
      ...chatDbId ? { chatDbId } : {},
      relativePath: databasePath(charDbId, chatDbId),
      status: "unknown"
    };
    try {
      const metadata = await createStorage(directory, charDbId, chatDbId).metadata();
      return { ...file, status: "exists", size: metadata.size };
    } catch (error) {
      return {
        ...file,
        status: missing(error) ? "missing" : "unknown",
        ...missing(error) ? {} : { reason: detail(error).message }
      };
    }
  }
  async function entries2(directory) {
    const result = [];
    for await (const item of directory.entries())
      result.push(item);
    return result;
  }
  var SQLITE_HEADER = "SQLite format 3\x00";
  async function scanInventory(directory) {
    const result = { entries: [], issues: [] };
    if (indexedDbSource(directory)) {
      try {
        const directories = new Set;
        for (const path of (await indexedDbFileKeys()).sort()) {
          const parts = path.split("/");
          for (let i = 1;i < parts.length; i++)
            directories.add(parts.slice(0, i).join("/"));
          const item = { relativePath: path, kind: "file" };
          result.entries.push(item);
          try {
            const file = await readStorageFile(directory, path);
            item.size = file.size;
            const header = file.bytes.subarray(0, 16);
            item.sqlite = header.length === 16 && String.fromCharCode(...header) === SQLITE_HEADER;
          } catch (error) {
            item.reason = detail(error).message;
          }
        }
        result.entries.push(...[...directories].map((relativePath) => ({ relativePath, kind: "directory" })));
        result.entries.sort((a, b) => a.relativePath.localeCompare(b.relativePath));
      } catch (error) {
        result.issues.push({ relativePath: "", reason: detail(error).message });
      }
      return result;
    }
    const walk = async (handle, prefix, entry) => {
      let children;
      try {
        children = await entries2(handle);
      } catch (error) {
        const reason = detail(error).message;
        if (entry)
          entry.reason = reason;
        result.issues.push({ relativePath: prefix, reason });
        return;
      }
      children.sort((a, b) => a[0].localeCompare(b[0]));
      for (const [name, child] of children) {
        const relativePath = prefix ? `${prefix}/${name}` : name;
        if (child.kind === "file" && isTemporaryFileName(name)) {
          if (entry)
            entry.temporary = true;
          continue;
        }
        if (child.kind === "directory") {
          const item = { relativePath, kind: "directory" };
          result.entries.push(item);
          await walk(child, relativePath, item);
          continue;
        }
        const item = { relativePath, kind: "file" };
        result.entries.push(item);
        try {
          const file = await child.getFile();
          item.size = file.size;
          const header = new Uint8Array(await file.slice(0, 16).arrayBuffer());
          item.sqlite = header.length === 16 && String.fromCharCode(...header) === SQLITE_HEADER;
        } catch (error) {
          item.reason = detail(error).message;
        }
      }
    };
    await walk(storageDirectory(directory), "");
    return result;
  }
  async function scanDatabase(db, directory, charDbId, chatDbId) {
    const file = await scanFile(directory, charDbId, chatDbId);
    const result = {
      charDbId,
      ...chatDbId ? { chatDbId } : {},
      relativePath: file.relativePath,
      status: file.status === "exists" ? "checked" : file.status,
      ...file.reason ? { reason: file.reason } : {},
      meta: "absent",
      dvs: []
    };
    if (result.status !== "checked")
      return result;
    try {
      await db.openExisting();
      const rows = async (sql, binds = []) => (await db.query({ sql, binds })).rows;
      const tables = new Map((await rows("SELECT name,sql FROM sqlite_master WHERE type='table'")).map((row) => [
        String(row[0]),
        String(row[1])
      ]));
      const meta = tables.get("__stsh_meta");
      if (meta !== undefined) {
        result.meta = sameDefinition(meta, SCOPED_META_TABLE_SQL) ? "valid" : "invalid";
        try {
          const identity = (await rows("SELECT value FROM __stsh_meta WHERE key='identity'"))[0];
          if (identity) {
            const value = JSON.parse(String(identity[0]));
            result.identity = value && typeof value === "object" && typeof value.scope === "string" && typeof value.charDbId === "string" && (value.chatDbId === undefined || typeof value.chatDbId === "string") ? {
              scope: value.scope,
              charDbId: value.charDbId,
              ...value.chatDbId !== undefined ? { chatDbId: value.chatDbId } : {}
            } : "invalid";
          }
        } catch {
          result.identity = "invalid";
        }
      }
      if ([...tables.keys()].some((name) => name.startsWith("_dvs_"))) {
        for (const [name, sql] of [
          ["_dvs_version", DVS_VERSION_TABLE_SQL],
          ["_dvs_gc_counter", DVS_GC_COUNTER_TABLE_SQL]
        ]) {
          const stored = tables.get(name);
          if (stored === undefined)
            result.dvs.push(`缺少 DVS 系统表 ${name}。`);
          else if (!sameDefinition(stored, sql))
            result.dvs.push(`DVS 系统表 ${name} 的定义与当前版本不同。`);
        }
        for (const [name, sql] of tables)
          if (name.startsWith("_dvs_index_") && !sameDefinition(sql, createIndexSql(name.slice("_dvs_index_".length))))
            result.dvs.push(`DVS 索引表 ${name} 的定义与当前版本不同。`);
      }
    } catch (error) {
      result.status = "unknown";
      result.reason = detail(error).message;
      result.failure = db.loadFailureStage ?? "database";
    }
    return result;
  }
  async function readScanFile(directory, relativePath) {
    const segments = checkRelativePath(relativePath, "read");
    if (typeof segments === "string")
      throw new ServiceError({ code: "INVALID_REQUEST", message: segments });
    return readStorageFile(directory, relativePath);
  }

  // src/worker/entity-deletion-records.ts
  var damaged2 = (message) => new ServiceError({ code: "LOAD_FAILED", message });

  class DeletionRecords {
    root;
    targets;
    entities;
    constructor(root, targets, entities) {
      this.root = root;
      this.targets = targets;
      this.entities = entities;
    }
    async scanRecord(expected) {
      const snapshot = await scanRecords(this.root, "");
      if (!snapshot.rootReadable)
        throw damaged2(snapshot.issues[0]?.reason ?? snapshot.differences[0]?.message ?? (snapshot.management === "uninitialized" ? "管理库尚未初始化，没有管理记录。" : "管理记录无法读取。"));
      return snapshot.records.find((row) => row.scope === expected.scope && row.referenceId === expected.referenceId);
    }
    async assertScanRecord(expected, allowDeleted = false, allowRetained = false) {
      const current = await this.scanRecord(expected);
      const keys = [
        "referenceId",
        "parentReferenceId",
        "scope",
        "avatar",
        "file",
        "id",
        "parent",
        "generation",
        "confirmed",
        "origin"
      ];
      if (!current || expected.generation === undefined || expected.confirmed === undefined || expected.origin === undefined || keys.some((key) => current[key] !== expected[key]) || current.state !== expected.state && !(allowDeleted && current.state === "deleted") && !(allowRetained && expected.state === "active" && current.state === "retained")) {
        throw new ServiceError({
          code: "STALE_IDENTITY",
          resultKind: "identity",
          resultState: "not-applied",
          message: "原扫描记录的编号、身份或坐标已改变，请重新扫描。"
        });
      }
      return current;
    }
    scanGuard(expected, state) {
      return rawGuard(expected.scope === "chat" ? `SELECT 1 FROM ${CHATS} c JOIN ${ROLES} r USING(role_id) WHERE c.chat_id=? AND c.role_id=? AND r.avatar_name=? AND c.file_name=? AND c.chat_dbid IS ? AND c.parent_char_dbid=? AND c.generation=? AND c.confirmed=? AND c.origin=? AND c.state=?` : `SELECT 1 FROM ${ROLES} WHERE role_id=? AND avatar_name=? AND char_dbid IS ? AND generation=? AND confirmed=? AND origin=? AND state=?`, expected.scope === "chat" ? [
        expected.referenceId,
        expected.parentReferenceId,
        expected.avatar,
        expected.file,
        expected.id,
        expected.parent,
        expected.generation,
        Number(expected.confirmed),
        expected.origin,
        state
      ] : [
        expected.referenceId,
        expected.avatar,
        expected.id,
        expected.generation,
        Number(expected.confirmed),
        expected.origin,
        state
      ]);
    }
    async hasScanChildren(referenceId) {
      return (await this.root.query({ sql: `SELECT 1 FROM ${CHATS} WHERE role_id=? LIMIT 1`, binds: [referenceId] })).rows.length > 0;
    }
    async protectionReferences(target) {
      await this.entities.ready();
      return protectionReferences(this.root, target);
    }
    async readDeletion(input) {
      const known = input.expected ? await this.entities.readReference(input.entity, input.chat, input.expected.generation, input.expected.id, input.expected.referenceId) : undefined;
      if (input.expected && !known)
        throw new ServiceError({ code: "STALE_IDENTITY", message: "原删除对象已失效。" });
      const entity = known?.currentEntity ?? input.entity, c = coordinate(entity, input.chat), reference = known?.reference ?? await currentReference(this.root, c), children = [];
      if (!input.chat)
        for (const row of await readEntityRows(this.root, `SELECT c.chat_id,r.avatar_name,c.file_name,c.chat_dbid,c.parent_char_dbid,c.generation,c.confirmed,c.origin FROM ${CHATS} c JOIN ${ROLES} r USING(role_id) WHERE r.avatar_name=?`, [c.avatar]))
          children.push({ entity: JSON.stringify([row[1], row[2]]), reference: chatRow(row) });
      const credentials = [
        ...reference ? [{ entity, chat: input.chat, reference }] : [],
        ...children.map((c) => ({ ...c, chat: true }))
      ].map((v) => ({
        entity: v.entity,
        chat: v.chat,
        generation: v.reference.generation,
        id: v.reference.id,
        referenceId: v.reference.referenceId,
        ...v.reference.parent ? { parent: v.reference.parent } : {}
      }));
      return {
        entity,
        ...reference ? { reference } : {},
        ...!input.chat ? { roleRecordId: await this.entities.roleIdFor(c.avatar) } : {},
        children,
        credentials
      };
    }
    async settleDeletion(task, options = {}) {
      await this.entities.ready();
      if (task.phase === "invalidated")
        return;
      const commands = [], cleanups = [];
      const candidate = (r, chat) => {
        if (!r.id)
          return;
        const charDbId = chat ? r.parent : r.id, chatDbId = chat ? r.id : undefined;
        if (cleanups.some((t) => t.scope === (chat ? "chat" : "char") && t.charDbId === charDbId && t.chatDbId === chatDbId))
          return;
        cleanups.push({
          taskId: `${task.taskId}:${chat ? "chat" : "char"}:${charDbId}:${chatDbId ?? ""}`,
          deletionTaskId: task.taskId,
          scope: chat ? "chat" : "char",
          charDbId,
          ...chatDbId ? { chatDbId } : {},
          phase: "waiting"
        });
      };
      if (task.reference)
        commands.push(referenceGuard(coordinate(task.entity, task.chat), task.reference));
      if (!task.chat)
        for (const child of task.children)
          commands.push(referenceGuard(coordinate(child.entity, true), child.reference));
      if (task.reference) {
        commands.push({
          sql: `UPDATE ${task.chat ? CHATS : ROLES} SET state='deleted' WHERE ${task.chat ? "chat_id" : "role_id"}=?`,
          binds: [task.reference.referenceId]
        });
        candidate(task.reference, task.chat);
      } else if (task.roleRecordId)
        commands.push({ sql: `UPDATE ${ROLES} SET state='deleted' WHERE role_id=?`, binds: [task.roleRecordId] });
      if (!task.chat)
        for (const child of task.children) {
          commands.push({
            sql: `UPDATE ${CHATS} SET state=? WHERE chat_id=?`,
            binds: [
              task.deleteChats === true && options.childrenDeleted === true ? "deleted" : "retained",
              child.reference.referenceId
            ]
          });
          candidate(child.reference, true);
        }
      if (commands.length)
        await saveEntities(this.root, commands);
      return cleanups;
    }
    async finishCleanup(task) {
      const refs = await this.protectionReferences(task);
      if (refs.active || refs.retained || refs.unconfirmed)
        throw entityConflict("数据库仍有引用，不能移除记录。");
      const commands = [];
      if (task.scope === "chat")
        commands.push({
          sql: `DELETE FROM ${CHATS} WHERE parent_char_dbid=? AND chat_dbid=? AND state='deleted'`,
          binds: [task.charDbId, task.chatDbId]
        });
      else
        commands.push({
          sql: `DELETE FROM ${ROLES} WHERE char_dbid=? AND state='deleted' AND NOT EXISTS(SELECT 1 FROM ${CHATS} WHERE role_id=${ROLES}.role_id)`,
          binds: [task.charDbId]
        });
      commands.push({
        sql: `DELETE FROM ${TARGETS} WHERE scope=? AND char_dbid=? AND chat_dbid=?`,
        binds: [task.scope, task.charDbId, task.chatDbId ?? ""]
      });
      if (task.scope === "chat")
        commands.push({
          sql: `DELETE FROM ${ROLES} WHERE char_dbid=? AND state='deleted' AND NOT EXISTS(SELECT 1 FROM ${CHATS} WHERE role_id=${ROLES}.role_id) AND (NOT EXISTS(SELECT 1 FROM ${TARGETS} WHERE scope='char' AND char_dbid=?) OR EXISTS(SELECT 1 FROM ${ROLES} other WHERE other.char_dbid=? AND other.state='active'))`,
          binds: [task.charDbId, task.charDbId, task.charDbId]
        });
      await saveEntities(this.root, commands);
    }
    async finishDeletion(task) {
      await this.entities.ready();
      const rows = [
        ...task.reference ? [{ reference: task.reference, chat: task.chat }] : [],
        ...task.children.map((child) => ({ reference: child.reference, chat: true }))
      ];
      const commands = [];
      for (const { reference: r, chat } of rows) {
        if (!r.id)
          continue;
        const refs = await this.protectionReferences({
          scope: chat ? "chat" : "char",
          charDbId: chat ? r.parent : r.id,
          chatDbId: chat ? r.id : undefined
        });
        const target = await this.targets.read({
          scope: chat ? "chat" : "char",
          charDbId: chat ? r.parent : r.id,
          ...chat ? { chatDbId: r.id } : {}
        });
        if (!target || refs.active || refs.retained)
          commands.push({
            sql: chat ? `DELETE FROM ${CHATS} WHERE chat_id=? AND state='deleted'` : `DELETE FROM ${ROLES} WHERE role_id=? AND state='deleted' AND NOT EXISTS(SELECT 1 FROM ${CHATS} WHERE role_id=?)`,
            binds: chat ? [r.referenceId] : [r.referenceId, r.referenceId]
          });
      }
      if (!task.chat && task.roleRecordId && task.reference?.id) {
        const refs = await this.protectionReferences({ scope: "char", charDbId: task.reference.id });
        const target = await this.targets.read({ scope: "char", charDbId: task.reference.id });
        if (!target || refs.active)
          commands.push({
            sql: `DELETE FROM ${ROLES} WHERE role_id=? AND state='deleted' AND NOT EXISTS(SELECT 1 FROM ${CHATS} WHERE role_id=?)`,
            binds: [task.roleRecordId, task.roleRecordId]
          });
      }
      if (commands.length)
        await saveEntities(this.root, commands);
    }
    async prepareScanDeletion(expected, id, allowRetained, revision) {
      await this.entities.ready();
      const current = await this.assertScanRecord(expected, true, allowRetained), entity = expected.scope === "char" ? expected.avatar : JSON.stringify([expected.avatar, expected.file]);
      const reference = expected.generation > 0 ? {
        id: expected.id,
        generation: expected.generation,
        confirmed: expected.confirmed,
        origin: expected.origin,
        referenceId: expected.referenceId,
        ...expected.scope === "chat" ? { parent: expected.parent } : {}
      } : undefined;
      const deletion = {
        taskId: id,
        operationId: id,
        revision,
        entity,
        chat: expected.scope === "chat",
        ...reference ? { reference } : { roleRecordId: expected.referenceId },
        children: [],
        credentials: [],
        phase: "invalidated",
        version: 1,
        evidence: { source: "scan-absence" }
      };
      if (current.state !== "deleted") {
        const commands = [
          this.scanGuard(expected, current.state),
          {
            sql: `UPDATE ${expected.scope === "chat" ? CHATS : ROLES} SET state='deleted' WHERE ${expected.scope === "chat" ? "chat_id" : "role_id"}=?`,
            binds: [expected.referenceId]
          }
        ];
        if (expected.scope === "char")
          commands.push({
            sql: `UPDATE ${CHATS} SET state='retained' WHERE role_id=? AND state='active'`,
            binds: [expected.referenceId]
          });
        await saveEntities(this.root, commands);
      }
      const cleanup = expected.id ? {
        taskId: `${id}:${expected.scope}:${expected.id}`,
        deletionTaskId: id,
        scope: expected.scope,
        charDbId: expected.scope === "char" ? expected.id : expected.parent,
        ...expected.scope === "chat" ? { chatDbId: expected.id } : {},
        phase: "waiting"
      } : undefined;
      return { deletion, ...cleanup ? { cleanup } : {} };
    }
    async removeOrphanTarget(target) {
      await this.entities.ready();
      const key = [target.scope, target.charDbId, target.chatDbId ?? ""];
      try {
        await saveEntities(this.root, [
          rawGuard(`SELECT 1 FROM ${TARGETS} WHERE scope=? AND char_dbid=? AND chat_dbid=? AND origin=? AND state=? AND NOT EXISTS(SELECT 1 FROM ${ROLES} WHERE ?='char' AND lower(char_dbid)=lower(?)) AND NOT EXISTS(SELECT 1 FROM ${CHATS} WHERE ?='chat' AND lower(parent_char_dbid)=lower(?) AND lower(chat_dbid)=lower(?))`, [
            ...key,
            target.origin,
            target.state,
            target.scope,
            target.charDbId,
            target.scope,
            target.charDbId,
            target.chatDbId ?? ""
          ]),
          { sql: `DELETE FROM ${TARGETS} WHERE scope=? AND char_dbid=? AND chat_dbid=?`, binds: key }
        ]);
        return true;
      } catch (error) {
        if (errorData(error).code === "IDENTITY_CONFLICT")
          return false;
        throw error;
      }
    }
    async purgeScanRecord(expected) {
      await this.entities.ready();
      if (!await this.scanRecord(expected))
        return;
      const commands = [this.scanGuard(expected, "deleted")];
      if (expected.scope === "char")
        commands.push(rawGuard(`SELECT 1 WHERE NOT EXISTS(SELECT 1 FROM ${CHATS} WHERE role_id=?)`, [expected.referenceId]));
      commands.push({
        sql: `DELETE FROM ${expected.scope === "chat" ? CHATS : ROLES} WHERE ${expected.scope === "chat" ? "chat_id" : "role_id"}=?`,
        binds: [expected.referenceId]
      });
      if (expected.id)
        commands.push({
          sql: expected.scope === "chat" ? `DELETE FROM ${TARGETS} WHERE scope='chat' AND char_dbid=? AND chat_dbid=? AND NOT EXISTS(SELECT 1 FROM ${CHATS} WHERE parent_char_dbid=? AND chat_dbid=?)` : `DELETE FROM ${TARGETS} WHERE scope='char' AND char_dbid=? AND NOT EXISTS(SELECT 1 FROM ${ROLES} WHERE char_dbid=?)`,
          binds: expected.scope === "chat" ? [expected.parent, expected.id, expected.parent, expected.id] : [expected.id, expected.id]
        });
      await saveEntities(this.root, commands);
    }
  }

  // src/worker/entity-records.ts
  var invalid4 = (message) => new ServiceError({ code: "INVALID_REQUEST", message });
  var damaged3 = (message) => new ServiceError({ code: "LOAD_FAILED", message });
  function assertKey(key) {
    if (typeof key !== "string" || !key.trim() || key.length > 4096 || key.includes("\x00"))
      throw invalid4("实体记录键必须是 1—4096 字符的非空字符串，不能包含空字符。");
  }

  class RootEntities {
    root;
    cleanupWaiting;
    targets;
    deletions;
    constructor(root, targets, cleanupWaiting = () => false) {
      this.root = root;
      this.cleanupWaiting = cleanupWaiting;
      this.targets = targets ?? new RootTargets(root);
      this.deletions = new DeletionRecords(root, this.targets, this);
    }
    async ready() {
      await this.targets.ready();
    }
    hasManagement() {
      return this.targets.hasManagement();
    }
    async roleIdFor(avatar) {
      await this.ready();
      const rows = await readEntityRows(this.root, `SELECT role_id FROM ${ROLES} WHERE avatar_name=?`, [avatar]);
      if (rows.length > 1)
        throw damaged3("当前角色文件名对应多个有效记录。");
      return rows[0] ? Number(rows[0][0]) : undefined;
    }
    async referenceInfo(entity, chat) {
      await this.ready();
      const reference = await currentReference(this.root, coordinate(entity, chat));
      return reference ? { referenceId: reference.referenceId, entity, reference } : undefined;
    }
    sameReference(a, b) {
      return a.id === b.id && a.generation === b.generation && a.confirmed === b.confirmed && a.origin === b.origin && a.parent === b.parent && (b.referenceId === undefined || a.referenceId === b.referenceId);
    }
    async get(key) {
      assertKey(key);
      await this.ready();
      const c = parseEntityKey(key);
      if (!c)
        throw invalid4("只支持角色或聊天引用记录。");
      return await currentReference(this.root, c);
    }
    async readReference(entity, chat, generation, id, referenceId) {
      await this.ready();
      let reference, currentEntity = entity;
      if (referenceId !== undefined) {
        const rows = chat ? await readEntityRows(this.root, `SELECT c.chat_id,r.avatar_name,c.file_name,c.chat_dbid,c.parent_char_dbid,c.generation,c.confirmed,c.origin FROM ${CHATS} c JOIN ${ROLES} r USING(role_id) WHERE c.chat_id=?`, [referenceId]) : await readEntityRows(this.root, `SELECT role_id,avatar_name,char_dbid,generation,confirmed,origin FROM ${ROLES} WHERE role_id=? AND generation>0`, [referenceId]);
        const row = rows[0];
        if (!row)
          return;
        reference = chat ? chatRow(row) : roleRow(row);
        currentEntity = chat ? JSON.stringify([row[1], row[2]]) : String(row[1]);
      } else
        reference = await currentReference(this.root, coordinate(entity, chat));
      if (!reference || generation !== undefined && reference.generation !== generation || id !== undefined && reference.id !== id)
        return;
      return { reference, currentEntity };
    }
    async put(key, value, expected = null) {
      assertKey(key);
      await this.ready();
      const c = parseEntityKey(key);
      if (c)
        return this.putReference(c, validateReference(value, c.chat), expected === null ? null : validateReference(expected, c.chat));
      throw invalid4("只支持角色或聊天引用记录。");
    }
    async putChatProposal(binding, entity, value, expected) {
      await this.ready();
      const c = coordinate(entity, true), next = validateReference(value, true);
      const commands = await this.referenceCommands(c, next, expected === null ? null : validateReference(expected, true));
      commands.push(...await this.targets.generatedCommands(binding));
      if (!commands.length)
        return;
      await saveEntities(this.root, commands);
      await this.checkReference(c, next);
    }
    async referenceCommands(c, value, expected) {
      const old = await currentReference(this.root, c);
      if (old && this.sameReference(old, value))
        return [];
      if (expected ? !old || !this.sameReference(old, expected) : !!old)
        throw entityConflict("当前文件引用已改变。");
      if (value.referenceId !== undefined && value.referenceId !== old?.referenceId || old && value.generation < old.generation)
        throw entityConflict("对象编号或身份版本不匹配。");
      if (value.id && this.cleanupWaiting({
        scope: c.chat ? "chat" : "char",
        charDbId: c.chat ? value.parent : value.id,
        chatDbId: c.chat ? value.id : undefined
      }))
        throw entityConflict("数据库正在清理。");
      const commands = old ? [referenceGuard(c, old)] : [];
      if (c.chat) {
        commands.push({
          sql: `INSERT INTO ${ROLES}(avatar_name,char_dbid,generation,confirmed,origin) SELECT ?,NULL,0,0,'legacy' WHERE NOT EXISTS(SELECT 1 FROM ${ACTIVE_ROLES} WHERE avatar_name=?)`,
          binds: [c.avatar, c.avatar]
        });
        commands.push(old ? {
          sql: `UPDATE ${CHATS} SET chat_dbid=?,parent_char_dbid=?,generation=?,confirmed=?,origin=? WHERE chat_id=?`,
          binds: [
            value.id,
            value.parent,
            value.generation,
            Number(value.confirmed),
            value.origin,
            old.referenceId
          ]
        } : {
          sql: `INSERT INTO ${CHATS}(role_id,file_name,chat_dbid,parent_char_dbid,generation,confirmed,origin) SELECT role_id,?,?,?,?,?,? FROM ${ACTIVE_ROLES} WHERE avatar_name=?`,
          binds: [
            c.file,
            value.id,
            value.parent,
            value.generation,
            Number(value.confirmed),
            value.origin,
            c.avatar
          ]
        });
      } else
        commands.push(old ? {
          sql: `UPDATE ${ROLES} SET char_dbid=?,generation=?,confirmed=?,origin=? WHERE role_id=?`,
          binds: [value.id, value.generation, Number(value.confirmed), value.origin, old.referenceId]
        } : {
          sql: `INSERT INTO ${ROLES}(avatar_name,char_dbid,generation,confirmed,origin) VALUES(?,?,?,?,?) ON CONFLICT(avatar_name) WHERE state='active' DO UPDATE SET char_dbid=excluded.char_dbid,generation=excluded.generation,confirmed=excluded.confirmed,origin=excluded.origin WHERE generation=0`,
          binds: [c.avatar, value.id, value.generation, Number(value.confirmed), value.origin]
        });
      return commands;
    }
    async putReference(c, value, expected) {
      const commands = await this.referenceCommands(c, value, expected);
      if (!commands.length)
        return;
      await saveEntities(this.root, commands);
      await this.checkReference(c, value);
    }
    async checkReference(c, value) {
      const actual = await currentReference(this.root, c);
      if (!actual || !this.sameReference(actual, value))
        throw damaged3("对象保存后读回不一致。");
    }
    async confirmUnknownRename(next, chat, observed) {
      await this.ready();
      await this.putReference(coordinate(next, chat), validateReference(observed, chat), null);
      return await currentReference(this.root, coordinate(next, chat));
    }
    async renameRole(old, next, expected) {
      return this.rename(old, next, false, expected);
    }
    async renameChat(old, next, expected) {
      return this.rename(old, next, true, expected);
    }
    async rename(old, next, chat, expected) {
      await this.ready();
      if (!expected.referenceId)
        throw invalid4("改名需要固定对象编号。");
      const c = coordinate(old, chat), n = coordinate(next, chat);
      if (chat && c.avatar !== n.avatar)
        throw invalid4("聊天改名不能改变角色。");
      const known = await this.readReference(old, chat, expected.generation, expected.id, expected.referenceId);
      if (!known)
        throw entityConflict("原对象已失效。");
      if (known.currentEntity === next)
        return known.reference;
      if (known.currentEntity !== old)
        throw entityConflict("对象已改为其他名称。");
      await saveEntities(this.root, [
        referenceGuard(c, expected),
        {
          sql: chat ? `UPDATE ${CHATS} SET file_name=? WHERE chat_id=?` : `UPDATE ${ROLES} SET avatar_name=? WHERE role_id=?`,
          binds: [chat ? n.file : n.avatar, expected.referenceId]
        }
      ]);
      return await currentReference(this.root, n);
    }
  }

  // src/scan-contracts.ts
  function scanEntryHasBasis(relativePath, kind, facts) {
    const part = parseDatabasePath(relativePath, kind);
    if (!part)
      return false;
    if (part.kind === "global" || part.kind === "characters")
      return true;
    const char = part.charDbId;
    const roles = new Set(facts.roles.map((id) => id.toLowerCase()));
    const chats = new Set(facts.chats.map(([parent, id]) => `${parent.toLowerCase()}/${id.toLowerCase()}`));
    const target = (scope, charDbId, chatDbId) => facts.targets.some((t) => t.scope === scope && t.charDbId.toLowerCase() === charDbId && (scope === "char" || (t.chatDbId ?? "").toLowerCase() === chatDbId));
    if (part.kind === "character" || part.kind === "chats")
      return roles.has(char) || facts.chatParents.some((parent) => parent.toLowerCase() === char) || facts.targets.some((t) => t.charDbId.toLowerCase() === char);
    if (part.kind === "char")
      return roles.has(char) || target("char", char);
    return chats.has(`${char}/${part.chatDbId}`) || target("chat", char, part.chatDbId);
  }

  // src/scan-association-rules.ts
  var sameId = (a, b) => a?.toLowerCase() === b?.toLowerCase();
  function classifyScanDatabase(database, origin) {
    if (!database)
      return "unknown";
    if (database.status === "missing")
      return "missing";
    if (database.status === "unknown")
      return database.failure === "database" ? "unavailable" : "unknown";
    const identity = database.identity;
    if (typeof identity === "object" && (identity.scope !== (database.chatDbId ? "chat" : "char") || !sameId(identity.charDbId, database.charDbId) || !sameId(identity.chatDbId, database.chatDbId)))
      return "needs-repair";
    if (database.meta === "invalid" || identity === "invalid" || !identity && origin === "generated")
      return "needs-repair";
    return "usable";
  }
  var repairDatabaseUsable = (database, origin) => classifyScanDatabase(database, origin) === "usable";
  function decideChatAssociation(facts) {
    const { original, observed } = facts;
    if (original?.state === "usable")
      return { kind: "use", id: original.id };
    if (original?.state === "missing" && facts.neverCreated && (!observed || sameId(original.id, observed.id)))
      return { kind: "use", id: original.id };
    if (original?.state === "needs-repair")
      return { kind: "blocked", reason: "original-needs-repair" };
    if (original?.state === "unknown")
      return { kind: "blocked", reason: "original-unknown" };
    if (observed?.state === "usable")
      return facts.observedOwnedElsewhere ? { kind: "blocked", reason: "observed-owned-elsewhere" } : { kind: "use", id: observed.id };
    return { kind: "blocked", reason: "no-usable-database" };
  }

  // src/worker/scan-repair.ts
  var changed = (message = "扫描后数据发生变化，本项未执行。请重新扫描。") => ({
    status: "skipped",
    message,
    registrationChanged: false
  });
  var recordKeys = [
    "scope",
    "referenceId",
    "parentReferenceId",
    "avatar",
    "file",
    "id",
    "parent",
    "state",
    "generation",
    "confirmed",
    "origin",
    "initialization"
  ];
  var sameRecord = (a, b) => b === null ? a === undefined : !!a && recordKeys.every((key) => a[key] === b[key]);
  var sameTarget = (a, b) => b === null ? a === undefined : !!a && ["scope", "charDbId", "chatDbId", "origin", "state"].every((key) => a[key] === b[key]);
  function validateScanRepair(request) {
    if (request?.scope === "char") {
      if (!["check", "apply"].includes(request.phase) || typeof request.avatar !== "string" || !request.avatar || request.avatar.length > 4096 || request.avatar.includes("\x00") || !isUuid(request.charDbId) || request.expectedRole?.scope !== "char" || request.expectedRole.avatar !== request.avatar || request.expectedRole.id !== request.charDbId || !("expectedTarget" in request) || request.expectedTarget !== null && (request.expectedTarget?.scope !== "char" || request.expectedTarget.charDbId !== request.charDbId || request.expectedTarget.chatDbId !== undefined))
        throw new ServiceError({ code: "INVALID_REQUEST", message: "角色登记修复需要固定角色文件、编号和原登记。" });
      return;
    }
    if (request?.scope !== "chat")
      throw new ServiceError({ code: "INVALID_REQUEST", message: "扫描修复范围无效。" });
    if (!request || !["check", "apply"].includes(request.phase) || ![request.avatar, request.file].every((value) => typeof value === "string" && !!value && value.length <= 4096 && !value.includes("\x00")) || !isUuid(request.charDbId) || !isUuid(request.chatDbId) || !("expectedRole" in request) || !("expectedChat" in request) || !("expectedTarget" in request) || request.expectedRole !== null && (!request.expectedRole || request.expectedRole.scope !== "char" || request.expectedRole.avatar !== request.avatar) || request.expectedChat !== null && (!request.expectedChat || request.expectedChat.scope !== "chat" || request.expectedChat.avatar !== request.avatar || request.expectedChat.file !== request.file) || request.expectedTarget !== null && (!request.expectedTarget || request.expectedTarget.scope !== "chat" || request.expectedTarget.charDbId !== request.charDbId || request.expectedTarget.chatDbId !== request.chatDbId) || (request.phase === "apply" ? request.confirmedChatId !== request.chatDbId : request.confirmedChatId !== undefined))
      throw new ServiceError({ code: "INVALID_REQUEST", message: "扫描修复需要固定聊天、原登记和已读回的目标编号。" });
  }
  async function repairScanRegistration(root, request, readDatabase, assertAvailable, invalidate = () => {}) {
    validateScanRepair(request);
    if (request.scope === "char")
      return repairRoleRegistration(root, request, readDatabase, assertAvailable, invalidate);
    assertAvailable();
    const snapshot = await scanRecords(root, "");
    if (snapshot.management !== "valid" || !snapshot.rootReadable)
      return changed("插件记录有异常。请先修复管理库，再重新扫描。");
    const roles = snapshot.records.filter((row) => row.scope === "char" && row.avatar === request.avatar && row.state === "active");
    const role = roles[0];
    const chats = snapshot.records.filter((row) => row.scope === "chat" && row.avatar === request.avatar && row.file === request.file && row.state !== "deleted");
    const chat = chats[0];
    const target = snapshot.targets.find((row) => row.scope === "chat" && row.charDbId === request.charDbId && row.chatDbId === request.chatDbId);
    const parentTarget = snapshot.targets.find((row) => row.scope === "char" && row.charDbId === request.charDbId);
    if (roles.length > 1 || chats.length > 1 || !sameRecord(role, request.expectedRole) || !sameRecord(chat, request.expectedChat) || !sameTarget(target, request.expectedTarget))
      return changed();
    if (role && (role.id !== null && role.id !== request.charDbId || role.state !== "active") || chat && (chat.parent !== request.charDbId || chat.state !== "active"))
      return changed();
    if ((!role?.id || !role.confirmed) && snapshot.records.some((row) => row.scope === "char" && row.state === "active" && row.referenceId !== role?.referenceId && row.id === request.charDbId))
      return changed("已有其他角色使用这份数据，本项未执行。请重新扫描。");
    if (role && snapshot.records.some((row) => row.scope === "chat" && row.parentReferenceId === role.referenceId && row.state !== "deleted" && row.parent !== request.charDbId))
      return changed("现有聊天的父角色登记不一致，本项未执行。请重新扫描。");
    if (snapshot.records.some((row) => row.scope === "chat" && row.state !== "deleted" && row.id === request.chatDbId && row.parent !== request.charDbId))
      return changed("这份聊天数据的现有归属不一致，本项未执行。请重新扫描。");
    const database = await readDatabase(request.charDbId, request.chatDbId);
    const origin = target?.origin ?? (snapshot.records.some((row) => row.scope === "chat" && row.parent === request.charDbId && row.id === request.chatDbId && row.origin === "generated") ? "generated" : "legacy");
    const never = database.status === "missing" && target?.origin === "generated" && target.state === "never" && chat?.id === request.chatDbId;
    const originalId = chat?.confirmed ? chat.id : null;
    const originalTarget = snapshot.targets.find((row) => row.scope === "chat" && row.charDbId === request.charDbId && row.chatDbId === originalId);
    const original = originalId ? {
      id: originalId,
      state: classifyScanDatabase(originalId === request.chatDbId ? database : await readDatabase(request.charDbId, originalId), originalId === request.chatDbId ? origin : originalTarget?.origin ?? (snapshot.records.some((row) => row.scope === "chat" && row.parent === request.charDbId && row.id === originalId && row.origin === "generated") ? "generated" : "legacy"))
    } : undefined;
    const decision = decideChatAssociation({
      original,
      observed: { id: request.chatDbId, state: classifyScanDatabase(database, origin) },
      neverCreated: never,
      observedOwnedElsewhere: !!originalId && originalId !== request.chatDbId && snapshot.records.some((row) => row.scope === "chat" && row.state !== "deleted" && row.referenceId !== chat.referenceId && row.parent === request.charDbId && row.id === request.chatDbId)
    });
    if (decision.kind === "blocked")
      return changed(decision.reason === "original-needs-repair" ? "原数据需要先修复结构，本项未改用其他数据。请重新扫描并处理对应的修复项目。" : decision.reason === "original-unknown" ? "原登记的数据尚不能确认，请重新扫描。" : decision.reason === "observed-owned-elsewhere" ? "另一份数据已有其他聊天登记，本项未改用该数据。请重新扫描。" : "本次不能恢复关联，原文件保留。请重新扫描，查看是否可以修复或重新开始使用。");
    if (decision.id !== request.chatDbId)
      return changed("原登记的数据仍可用，本项未改用另一份数据。请重新扫描。");
    const parentOrigin = parentTarget?.origin ?? (snapshot.records.some((row) => row.scope === "char" && row.id === request.charDbId && row.origin === "generated") ? "generated" : "legacy");
    const parentReady = parentTarget?.state !== "ready" && repairDatabaseUsable(await readDatabase(request.charDbId), parentOrigin);
    assertAvailable();
    if (request.phase === "check")
      return { status: "checked", message: "已复核，可以恢复聊天关联。", registrationChanged: false };
    const commands = [];
    const guards = [
      rawGuard(role ? `SELECT 1 FROM ${ROLES} WHERE role_id=? AND avatar_name=? AND char_dbid IS ? AND generation=? AND confirmed=? AND origin=? AND state='active'` : `SELECT 1 WHERE NOT EXISTS(SELECT 1 FROM ${ROLES} WHERE avatar_name=? AND state='active')`, role ? [role.referenceId, role.avatar, role.id, role.generation, Number(role.confirmed), role.origin] : [request.avatar]),
      rawGuard(chat ? `SELECT 1 FROM ${CHATS} WHERE chat_id=? AND role_id=? AND file_name=? AND chat_dbid IS ? AND parent_char_dbid=? AND generation=? AND confirmed=? AND origin=? AND state='active'` : `SELECT 1 WHERE NOT EXISTS(SELECT 1 FROM ${CHATS} c JOIN ${ROLES} r USING(role_id) WHERE r.avatar_name=? AND c.file_name=? AND c.state<>'deleted')`, chat ? [
        chat.referenceId,
        chat.parentReferenceId,
        chat.file,
        chat.id,
        chat.parent,
        chat.generation,
        Number(chat.confirmed),
        chat.origin
      ] : [request.avatar, request.file]),
      rawGuard(target ? `SELECT 1 FROM ${TARGETS} WHERE scope='chat' AND char_dbid=? AND chat_dbid=? AND origin=? AND state=?` : `SELECT 1 WHERE NOT EXISTS(SELECT 1 FROM ${TARGETS} WHERE scope='chat' AND char_dbid=? AND chat_dbid=?)`, [request.charDbId, request.chatDbId, ...target ? [target.origin, target.state] : []]),
      rawGuard(parentTarget ? `SELECT 1 FROM ${TARGETS} WHERE scope='char' AND char_dbid=? AND chat_dbid='' AND origin=? AND state=?` : `SELECT 1 WHERE NOT EXISTS(SELECT 1 FROM ${TARGETS} WHERE scope='char' AND char_dbid=? AND chat_dbid='')`, [request.charDbId, ...parentTarget ? [parentTarget.origin, parentTarget.state] : []])
    ];
    const roleChanged = !role?.id || !role.confirmed;
    if (!role)
      commands.push({
        sql: `INSERT INTO ${ROLES}(avatar_name,char_dbid,generation,confirmed,origin,state) VALUES(?,?,1,1,?,'active')`,
        binds: [request.avatar, request.charDbId, parentOrigin]
      });
    else if (roleChanged)
      commands.push({
        sql: `UPDATE ${ROLES} SET char_dbid=?,generation=?,confirmed=1 WHERE role_id=?`,
        binds: [request.charDbId, role.generation + (role.id === request.charDbId ? 0 : 1), role.referenceId]
      });
    const chatChanged = !chat || chat.id !== request.chatDbId || !chat.confirmed;
    if (!chat)
      commands.push({
        sql: `INSERT INTO ${CHATS}(role_id,file_name,chat_dbid,parent_char_dbid,generation,confirmed,origin,state) SELECT role_id,?,?,?,1,1,?,'active' FROM ${ROLES} WHERE avatar_name=? AND state='active'`,
        binds: [request.file, request.chatDbId, request.charDbId, origin, request.avatar]
      });
    else if (chatChanged)
      commands.push({
        sql: `UPDATE ${CHATS} SET chat_dbid=?,generation=?,confirmed=1,origin=? WHERE chat_id=?`,
        binds: [request.chatDbId, chat.generation + (chat.id === request.chatDbId ? 0 : 1), origin, chat.referenceId]
      });
    if (!target)
      commands.push({
        sql: `INSERT INTO ${TARGETS}(scope,char_dbid,chat_dbid,origin,state) VALUES('chat',?,?,?,'ready')`,
        binds: [request.charDbId, request.chatDbId, origin]
      });
    else if (!never && target.state !== "ready")
      commands.push({
        sql: `UPDATE ${TARGETS} SET state='ready' WHERE scope='chat' AND char_dbid=? AND chat_dbid=?`,
        binds: [request.charDbId, request.chatDbId]
      });
    if (parentReady)
      commands.push(parentTarget ? {
        sql: `UPDATE ${TARGETS} SET state='ready' WHERE scope='char' AND char_dbid=? AND chat_dbid=''`,
        binds: [request.charDbId]
      } : {
        sql: `INSERT INTO ${TARGETS}(scope,char_dbid,chat_dbid,origin,state) VALUES('char',?,'',?,'ready')`,
        binds: [request.charDbId, parentOrigin]
      });
    if (!commands.length)
      return {
        status: "unchanged",
        message: "已有登记正确，无需修改插件记录。",
        registrationChanged: false,
        record: chat,
        role,
        target
      };
    await root.transaction([...guards, ...commands], undefined, {
      management: true,
      beforeExecute: () => {
        assertAvailable();
        if (roleChanged && role)
          invalidate(role);
        if (chatChanged && chat)
          invalidate(chat);
      }
    });
    const saved = await scanRecords(root, "");
    const record = saved.records.find((row) => row.scope === "chat" && row.avatar === request.avatar && row.file === request.file && row.state === "active");
    if (!saved.rootReadable || record?.id !== request.chatDbId || !record.confirmed || record.parent !== request.charDbId)
      throw new ServiceError({
        code: "RESULT_UNCONFIRMED",
        resultState: "unconfirmed",
        message: "插件记录已提交，但未能读回确认。请重新扫描。"
      });
    return {
      status: "repaired",
      message: "聊天关联和插件记录已修复。",
      registrationChanged: true,
      record,
      role: saved.records.find((row) => row.scope === "char" && row.avatar === request.avatar && row.state === "active"),
      target: saved.targets.find((row) => row.scope === "chat" && row.charDbId === request.charDbId && row.chatDbId === request.chatDbId)
    };
  }
  async function repairRoleRegistration(root, request, readDatabase, assertAvailable, invalidate) {
    assertAvailable();
    const snapshot = await scanRecords(root, "");
    if (!snapshot.rootReadable || snapshot.management !== "valid")
      return changed("插件记录有异常。请先修复管理库，再重新扫描。");
    const roles = snapshot.records.filter((row) => row.scope === "char" && row.avatar === request.avatar && row.state === "active");
    const role = roles[0];
    const target = snapshot.targets.find((row) => row.scope === "char" && row.charDbId === request.charDbId);
    if (roles.length !== 1 || !sameRecord(role, request.expectedRole) || !sameTarget(target, request.expectedTarget))
      return changed();
    const origin = target?.origin ?? role.origin;
    if (!repairDatabaseUsable(await readDatabase(request.charDbId), origin))
      return changed("这份数据还不能直接使用，本项没有修改登记。请重新扫描，按新的检查结果处理。");
    assertAvailable();
    if (request.phase === "check")
      return { status: "checked", message: "已复核，可以修复角色登记。", registrationChanged: false };
    const commands = [];
    if (!target)
      commands.push({ sql: `INSERT INTO ${TARGETS} VALUES('char',?,'',?,'ready')`, binds: [request.charDbId, origin] });
    else if (target.state !== "ready")
      commands.push({
        sql: `UPDATE ${TARGETS} SET state='ready' WHERE scope='char' AND char_dbid=? AND chat_dbid=''`,
        binds: [request.charDbId]
      });
    if (!role.confirmed)
      commands.push({ sql: `UPDATE ${ROLES} SET confirmed=1 WHERE role_id=?`, binds: [role.referenceId] });
    if (!commands.length)
      return {
        status: "unchanged",
        message: "已有登记正确，无需修改插件记录。",
        registrationChanged: false,
        record: role,
        role,
        target
      };
    await root.transaction([
      rawGuard(`SELECT 1 FROM ${ROLES} WHERE role_id=? AND avatar_name=? AND char_dbid=? AND generation=? AND confirmed=? AND origin=? AND state='active'`, [role.referenceId, role.avatar, role.id, role.generation, Number(role.confirmed), role.origin]),
      rawGuard(target ? `SELECT 1 FROM ${TARGETS} WHERE scope='char' AND char_dbid=? AND chat_dbid='' AND origin=? AND state=?` : `SELECT 1 WHERE NOT EXISTS(SELECT 1 FROM ${TARGETS} WHERE scope='char' AND char_dbid=? AND chat_dbid='')`, [request.charDbId, ...target ? [target.origin, target.state] : []]),
      ...commands
    ], undefined, {
      management: true,
      beforeExecute: () => {
        assertAvailable();
        if (!role.confirmed)
          invalidate(role);
      }
    });
    const saved = await scanRecords(root, "");
    const record = saved.records.find((row) => row.scope === "char" && row.referenceId === role.referenceId);
    if (!saved.rootReadable || record?.initialization !== "ready" || !record.confirmed)
      throw new ServiceError({
        code: "RESULT_UNCONFIRMED",
        resultState: "unconfirmed",
        message: "插件记录已提交，但未能读回确认。请重新扫描。"
      });
    return {
      status: "repaired",
      message: "角色的插件记录已修复。",
      registrationChanged: true,
      record,
      role: record,
      target: saved.targets.find((row) => row.scope === "char" && row.charDbId === request.charDbId)
    };
  }

  // src/management-repair-rules.ts
  var MANAGEMENT_COLUMNS = {
    __stsh_meta: ["key", "value"],
    __stsh_targets: ["scope", "char_dbid", "chat_dbid", "origin", "state"],
    __stsh_roles: ["role_id", "avatar_name", "char_dbid", "generation", "confirmed", "origin", "state"],
    __stsh_chats: [
      "chat_id",
      "role_id",
      "file_name",
      "chat_dbid",
      "parent_char_dbid",
      "generation",
      "confirmed",
      "origin",
      "state"
    ]
  };
  var managementValueKey = (value) => JSON.stringify(value, (_key, cell) => cell instanceof Uint8Array ? { bytes: Array.from(cell) } : cell);
  var text = (value) => typeof value === "string" && !!value && value.length <= 4096 && !value.includes("\x00");
  var integer = (value, min) => typeof value === "number" && Number.isSafeInteger(value) && value >= min;
  var origin = (value) => value === "generated" || value === "legacy";
  var roleValid = (row) => integer(row[0], 1) && text(row[1]) && (row[2] === null || isUuid(row[2])) && integer(row[3], 0) && typeof row[4] === "number" && [0, 1].includes(row[4]) && origin(row[5]) && ["active", "deleted"].includes(String(row[6])) && (row[3] !== 0 || row[2] === null && row[4] === 0);
  var chatValid = (row) => integer(row[0], 1) && text(row[2]) && (row[3] === null || isUuid(row[3])) && isUuid(row[4]) && integer(row[5], 1) && typeof row[6] === "number" && [0, 1].includes(row[6]) && origin(row[7]) && ["active", "retained", "deleted"].includes(String(row[8]));
  var effectiveManagementTarget = (target, roles, chats) => ({
    ...target,
    origin: target.origin === "generated" || (target.scope === "char" ? roles.some((row) => row[2] === target.charDbId && row[5] === "generated") : chats.some((row) => row[4] === target.charDbId && row[3] === target.chatDbId && row[7] === "generated")) ? "generated" : "legacy"
  });
  function projectManagementStructure(facts) {
    const result = {
      replaceTables: [],
      rows: {},
      missing: {
        roleIdentity: !facts.tables.__stsh_roles?.columns.includes("char_dbid"),
        chatIdentity: !facts.tables.__stsh_chats?.columns.includes("chat_dbid"),
        chatParent: !facts.tables.__stsh_chats?.columns.includes("parent_char_dbid"),
        targetsTable: !facts.objects.some((object) => object.name === "__stsh_targets" && object.type === "table")
      }
    };
    const block = (code, object) => ({
      ...result,
      blocked: { code, ...object ? { object } : {} }
    });
    if (facts.unreadable.length)
      return block("unreadable", facts.unreadable[0]);
    if (facts.objects.some((o) => o.name.startsWith("__st_sle_helper_")))
      return block("legacy-format");
    if (!facts.objects.some((o) => o.name.startsWith("__stsh_")))
      return { ...result, empty: true };
    if (facts.objects.some((o) => o.name.startsWith("__stsh_") && o.expectedType === undefined && !["index", "trigger"].includes(o.type)))
      return block("unknown-management-object");
    for (const name of Object.keys(MANAGEMENT_COLUMNS)) {
      const table = facts.tables[name], object = facts.objects.find((o) => o.name === name);
      if (!object?.type) {
        if (name === "__stsh_targets") {
          result.rows[name] = [];
          result.replaceTables.push(name);
          continue;
        }
        return block("missing-table", name);
      }
      if (object.type !== "table")
        return block("object-kind", name);
      if (!table)
        return block("unreadable", name);
      const required = MANAGEMENT_COLUMNS[name];
      const missing = required.filter((column) => !table.columns.includes(column));
      if (missing.length && table.rows.length && !(name === "__stsh_chats" && missing.every((column) => ["role_id", "parent_char_dbid", "chat_dbid"].includes(column))) && !(name === "__stsh_roles" && missing.length === 1 && missing[0] === "char_dbid") && !(name === "__stsh_targets" && missing.length === 1 && missing[0] === "state"))
        return block("missing-columns", name);
      result.rows[name] = table.rows.map((row) => required.map((column) => {
        const index = table.columns.indexOf(column);
        return index < 0 ? null : row[index];
      }));
      if (!object.matches)
        result.replaceTables.push(name);
    }
    return result;
  }
  function decideManagementRepair(facts) {
    const result = {
      kind: "none",
      replaceTables: [],
      recreateObjects: [],
      rows: {},
      reasons: [],
      recordChanges: 0,
      recordsToCheck: [],
      targetsToCheck: [],
      insertTargets: []
    };
    const block = (code, object) => {
      result.kind = "blocked";
      result.reasons.push({ code, ...object ? { object } : {} });
      return result;
    };
    const projection = projectManagementStructure(facts);
    result.rows = projection.rows;
    result.replaceTables = projection.replaceTables;
    if (projection.blocked)
      return block(projection.blocked.code, projection.blocked.object);
    if (projection.empty)
      return result;
    const recovered = recoverManagementIdentities({
      roles: projection.rows.__stsh_roles,
      chats: projection.rows.__stsh_chats,
      targets: projection.rows.__stsh_targets,
      missing: projection.missing
    }, { recordChecks: facts.recordChecks, targetFiles: facts.targetFiles });
    result.rows = { ...projection.rows, ...recovered.rows };
    result.replaceTables.push(...recovered.replaceTables);
    result.recordChanges += recovered.recordChanges;
    result.reasons.push(...recovered.reasons);
    result.recordsToCheck = recovered.recordsToCheck;
    result.targetsToCheck.push(...recovered.targetsToCheck);
    const normalized = normalizeManagementRecords(result.rows, projection.missing, recovered.roleIdentityRedirect, facts.targetFiles);
    result.rows = normalized.rows;
    result.replaceTables.push(...normalized.replaceTables);
    result.recordChanges += normalized.recordChanges;
    result.reasons.push(...normalized.reasons);
    result.targetsToCheck.push(...normalized.targetsToCheck);
    if (normalized.blocked)
      return block(normalized.blocked.code, normalized.blocked.object);
    const targets = supplementManagementTargets(normalized.rows, projection.missing.targetsTable, facts.targetFiles);
    result.rows = { ...normalized.rows, ...targets.rows };
    result.insertTargets = targets.insertTargets;
    result.recordChanges += targets.recordChanges;
    result.reasons.push(...targets.reasons);
    result.targetsToCheck.push(...targets.targetsToCheck);
    if (targets.blocked)
      return block(targets.blocked.code, targets.blocked.object);
    const classified = classifyManagementRepair({
      rows: result.rows,
      replaceTables: result.replaceTables,
      recordChanges: result.recordChanges,
      reasons: result.reasons,
      insertTargets: result.insertTargets
    }, normalized.counts, { tables: facts.tables, objects: facts.objects, externalForeignKeys: facts.externalForeignKeys });
    return { ...result, ...classified };
  }
  function recoverManagementIdentities(input, facts) {
    const result = {
      rows: {
        __stsh_roles: input.roles.map((row) => [...row]),
        __stsh_chats: input.chats.map((row) => [...row]),
        __stsh_targets: input.targets.map((row) => [...row])
      },
      replaceTables: [],
      recordChanges: 0,
      reasons: [],
      recordsToCheck: [],
      targetsToCheck: []
    };
    const rawRoles = result.rows.__stsh_roles, rawChats = result.rows.__stsh_chats;
    const requireTarget = (requested) => {
      const target = effectiveManagementTarget(requested, rawRoles, rawChats);
      if (!result.targetsToCheck.some((item) => managementValueKey(item) === managementValueKey(target)))
        result.targetsToCheck.push(target);
      return facts.targetFiles.find((item) => managementValueKey(item.target) === managementValueKey(target))?.state;
    };
    const recordEvidence = (record) => {
      result.recordsToCheck.push(record);
      return facts.recordChecks.find((item) => item.record.scope === record.scope && item.record.referenceId === record.referenceId && item.record.avatar === record.avatar && item.record.file === record.file);
    };
    const roleIdentityRedirect = new Map;
    for (const row of rawRoles)
      if (!isUuid(row[2])) {
        const children = rawChats.filter((chat) => chat[1] === row[0]);
        const parents = new Set(children.map((chat) => chat[4]).filter(isUuid));
        if (children.length && parents.size === 1 && children.every((chat) => isUuid(chat[4]))) {
          const oldKey = managementValueKey(row[2]), replacement = [...parents][0];
          const redirects = roleIdentityRedirect.get(oldKey) ?? new Set;
          redirects.add(replacement);
          roleIdentityRedirect.set(oldKey, redirects);
          row[2] = replacement;
          result.recordChanges++;
          result.replaceTables.push("__stsh_roles");
          result.reasons.push({ code: "restore-parent", object: "__stsh_roles" });
        }
      }
    const removedTargets = new Set;
    const chatIdentityColumnMissing = input.missing.chatIdentity;
    for (const row of rawChats)
      if (!isUuid(row[4]) && input.missing.chatParent) {
        const parent = rawRoles.find((role) => role[0] === row[1]);
        if (parent && isUuid(parent[2]))
          row[4] = parent[2];
      }
    for (let index = rawChats.length - 1;index >= 0; index--) {
      const row = rawChats[index];
      if (chatValid(row) && !(chatIdentityColumnMissing && row[3] === null))
        continue;
      const role = rawRoles.find((role) => role[0] === row[1]);
      if (!role || !integer(row[0], Number.MIN_SAFE_INTEGER) || !text(role[1]) || !text(row[2]))
        continue;
      const coordinate = {
        scope: "chat",
        referenceId: row[0],
        avatar: role[1],
        file: row[2],
        id: row[3],
        parent: row[4]
      };
      const evidence = recordEvidence(coordinate);
      const peerIds = new Set(rawChats.filter((other) => other !== row && other[1] === row[1] && other[2] === row[2] && other[4] === row[4] && other[5] === row[5] && other[6] === row[6] && other[7] === row[7] && other[8] === row[8] && isUuid(other[3])).map((other) => other[3]));
      const candidate = peerIds.size === 1 ? [...peerIds][0] : evidence?.observation?.status === "same" && isUuid(evidence.observation.observedId) ? evidence.observation.observedId : undefined;
      if (!isUuid(row[3]) && (row[3] !== null || chatIdentityColumnMissing) && candidate && isUuid(row[4]) && origin(row[7]) && requireTarget({ scope: "chat", charDbId: row[4], chatDbId: candidate, origin: row[7] }) === "ready") {
        row[3] = candidate;
        result.recordChanges++;
        result.replaceTables.push("__stsh_chats");
        result.reasons.push({ code: "restore-identity", object: "__stsh_chats" });
        continue;
      }
      if (evidence?.observation?.status === "deleted" && evidence.files === "absent" && !rawChats.some((other) => other !== row && other[3] === row[3] && other[4] === row[4])) {
        for (const target of result.rows.__stsh_targets)
          if (target[0] === "chat" && target[1] === row[4] && target[2] === row[3])
            removedTargets.add(target);
        rawChats.splice(index, 1);
        result.recordChanges++;
        result.replaceTables.push("__stsh_chats");
        result.reasons.push({ code: "remove-unused-record", object: "__stsh_chats" });
      }
    }
    for (let index = rawRoles.length - 1;index >= 0; index--) {
      const row = rawRoles[index];
      if (roleValid(row) || !integer(row[0], Number.MIN_SAFE_INTEGER) || !text(row[1]))
        continue;
      const evidence = recordEvidence({
        scope: "char",
        referenceId: row[0],
        avatar: row[1],
        id: row[2]
      });
      if (evidence?.observation?.status === "deleted" && evidence.files === "absent" && !rawChats.some((chat) => chat[1] === row[0] || chat[4] === row[2]) && !rawRoles.some((other) => other !== row && other[2] === row[2])) {
        for (const target of result.rows.__stsh_targets)
          if (target[1] === row[2])
            removedTargets.add(target);
        rawRoles.splice(index, 1);
        result.recordChanges++;
        result.replaceTables.push("__stsh_roles");
        result.reasons.push({ code: "remove-unused-record", object: "__stsh_roles" });
      }
    }
    if (removedTargets.size) {
      result.rows.__stsh_targets = result.rows.__stsh_targets.filter((row) => !removedTargets.has(row));
      result.recordChanges += removedTargets.size;
      result.replaceTables.push("__stsh_targets");
    }
    return { ...result, roleIdentityRedirect };
  }
  function normalizeManagementRecords(input, missing, roleIdentityRedirect, targetFiles) {
    const result = {
      rows: Object.fromEntries(Object.entries(input).map(([name, rows]) => [name, rows.map((row) => [...row])])),
      replaceTables: [],
      recordChanges: 0,
      reasons: [],
      targetsToCheck: []
    };
    const dedupInputSizes = new Map(Object.keys(MANAGEMENT_COLUMNS).map((name) => [name, result.rows[name].length]));
    let versionChanged = false, restoredParents = 0, metaCount = 0;
    const product = () => ({
      ...result,
      counts: { before: dedupInputSizes, meta: metaCount, versionChanged, restoredParents }
    });
    const block = (code, object) => ({
      ...product(),
      blocked: { code, ...object ? { object } : {} }
    });
    const requireTarget = (requested) => {
      const target = effectiveManagementTarget(requested, result.rows.__stsh_roles, result.rows.__stsh_chats);
      if (!result.targetsToCheck.some((item) => managementValueKey(item) === managementValueKey(target)))
        result.targetsToCheck.push(target);
      return targetFiles.find((item) => managementValueKey(item.target) === managementValueKey(target))?.state;
    };
    const meta = result.rows.__stsh_meta;
    if (meta.some((row) => typeof row[0] !== "string" || typeof row[1] !== "string"))
      return block("invalid-record", "__stsh_meta");
    const metaKeys = new Map;
    for (const row of meta) {
      const old = metaKeys.get(row[0]);
      if (old && old[1] !== row[1])
        return block("conflicting-records", "__stsh_meta");
      metaKeys.set(row[0], row);
    }
    const version = metaKeys.get("schema_version")?.[1];
    let parsedVersion;
    try {
      parsedVersion = typeof version === "string" ? JSON.parse(version) : undefined;
    } catch {}
    if (typeof parsedVersion === "number" && Number.isSafeInteger(parsedVersion) && parsedVersion >= 0 && parsedVersion !== 6)
      return block("unknown-version", "__stsh_meta");
    const normalizedMeta = [...metaKeys.values()];
    metaCount = metaKeys.size;
    versionChanged = version !== "6";
    if (versionChanged) {
      const existing = normalizedMeta.find((row) => row[0] === "schema_version");
      if (existing)
        existing[1] = "6";
      else
        normalizedMeta.push(["schema_version", "6"]);
    }
    result.rows.__stsh_meta = normalizedMeta;
    const targets = result.rows.__stsh_targets;
    const uniqueTargets = new Map;
    let pendingTarget = false;
    for (const row of targets) {
      if (!isUuid(row[1])) {
        const derived = roleIdentityRedirect.get(managementValueKey(row[1]));
        const parents = row[0] === "chat" ? new Set(result.rows.__stsh_chats.filter((chat) => chat[3] === row[2] && isUuid(chat[4])).map((chat) => chat[4])) : derived;
        if (parents?.size === 1) {
          row[1] = [...parents][0];
          result.recordChanges++;
          result.replaceTables.push("__stsh_targets");
        }
      }
      if (!["char", "chat"].includes(String(row[0])) || !isUuid(row[1]) || (row[0] === "char" ? row[2] !== "" : !isUuid(row[2])) || !origin(row[3]))
        return block("invalid-record", "__stsh_targets");
      if (!["never", "creating", "ready"].includes(String(row[4]))) {
        const state = requireTarget({
          scope: row[0],
          charDbId: row[1],
          ...row[0] === "chat" ? { chatDbId: row[2] } : {},
          origin: row[3]
        });
        if (state !== "ready")
          pendingTarget = true;
        else {
          row[4] = "ready";
          result.recordChanges++;
          result.replaceTables.push("__stsh_targets");
          result.reasons.push({ code: "restore-target", object: "__stsh_targets" });
        }
      }
      const key = managementValueKey(row.slice(0, 3)), old = uniqueTargets.get(key);
      if (old && managementValueKey(old) !== managementValueKey(row))
        return block("conflicting-records", "__stsh_targets");
      uniqueTargets.set(key, row);
    }
    result.rows.__stsh_targets = [...uniqueTargets.values()];
    if (pendingTarget)
      return block("invalid-record", "__stsh_targets");
    const roles = result.rows.__stsh_roles;
    const roleIds = new Map, roleValues = new Map, roleRedirect = new Map;
    for (const row of [...roles].sort((a, b) => Number(a[0]) - Number(b[0]))) {
      if (missing.roleIdentity && row[2] === null)
        return block("missing-columns", "__stsh_roles");
      if (!roleValid(row))
        return block("invalid-record", "__stsh_roles");
      const id = row[0], oldId = roleIds.get(id);
      if (oldId && managementValueKey(oldId) !== managementValueKey(row))
        return block("conflicting-records", "__stsh_roles");
      roleIds.set(id, row);
      const key = managementValueKey(row.slice(1)), equivalent = roleValues.get(key);
      if (equivalent)
        roleRedirect.set(id, equivalent[0]);
      else
        roleValues.set(key, row);
    }
    const normalizedRoles = [...roleValues.values()];
    const activeAvatars = new Set;
    for (const row of normalizedRoles)
      if (row[6] === "active") {
        if (activeAvatars.has(row[1]))
          return block("conflicting-records", "__stsh_roles");
        activeAvatars.add(row[1]);
      }
    result.rows.__stsh_roles = normalizedRoles;
    const chats = result.rows.__stsh_chats;
    const chatIds = new Map, chatValues = new Map;
    for (const row of [...chats].sort((a, b) => Number(a[0]) - Number(b[0]))) {
      if (!chatValid(row) || missing.chatIdentity && row[3] === null)
        return block("invalid-record", "__stsh_chats");
      const id = row[0], oldId = chatIds.get(id);
      if (oldId && managementValueKey(oldId) !== managementValueKey(row))
        return block("conflicting-records", "__stsh_chats");
      chatIds.set(id, [...row]);
      const oldRoleId = row[1], redirected = typeof oldRoleId === "number" ? roleRedirect.get(oldRoleId) ?? oldRoleId : undefined;
      let parent = normalizedRoles.find((role) => role[0] === redirected);
      if (!parent) {
        const candidates = normalizedRoles.filter((role) => role[2] === row[4]);
        if (candidates.length !== 1)
          return block("unresolved-parent", "__stsh_chats");
        parent = candidates[0];
      }
      if (parent[2] !== row[4])
        return block("unresolved-parent", "__stsh_chats");
      if (row[1] !== parent[0]) {
        row[1] = parent[0];
        restoredParents++;
      }
      const key = managementValueKey(row.slice(1));
      if (!chatValues.has(key))
        chatValues.set(key, row);
    }
    const normalizedChats = [...chatValues.values()], activeChats = new Set;
    for (const row of normalizedChats)
      if (row[8] !== "deleted") {
        const key = managementValueKey(row.slice(1, 3));
        if (activeChats.has(key))
          return block("conflicting-records", "__stsh_chats");
        activeChats.add(key);
      }
    result.rows.__stsh_chats = normalizedChats;
    return product();
  }
  function supplementManagementTargets(input, targetsTableMissing, targetFiles) {
    const { __stsh_roles: normalizedRoles, __stsh_chats: normalizedChats } = input;
    const result = {
      rows: { __stsh_targets: input.__stsh_targets.map((row) => [...row]) },
      insertTargets: [],
      recordChanges: 0,
      reasons: [],
      targetsToCheck: []
    };
    const requireTarget = (target) => {
      result.targetsToCheck.push(target);
      return targetFiles.find((item) => managementValueKey(item.target) === managementValueKey(target))?.state;
    };
    const block = (code, object) => ({
      ...result,
      blocked: { code, ...object ? { object } : {} }
    });
    let unresolvedMissingTarget = false;
    const references = [
      ...normalizedRoles.filter((row) => isUuid(row[2])).map((row) => ({ scope: "char", charDbId: row[2], origin: row[5] })),
      ...normalizedChats.filter((row) => isUuid(row[3])).map((row) => ({
        scope: "chat",
        charDbId: row[4],
        chatDbId: row[3],
        origin: row[7]
      }))
    ];
    const grouped = new Map;
    for (const reference of references) {
      const key = managementValueKey([
        reference.scope,
        reference.charDbId,
        reference.scope === "chat" ? reference.chatDbId : ""
      ]);
      const old = grouped.get(key);
      grouped.set(key, old?.origin === "generated" ? old : reference);
    }
    for (const reference of grouped.values()) {
      if (result.rows.__stsh_targets.some((row) => row[0] === reference.scope && row[1] === reference.charDbId && row[2] === (reference.scope === "chat" ? reference.chatDbId : "")))
        continue;
      const fileState = requireTarget(reference);
      if (fileState === "ready") {
        const row = [
          reference.scope,
          reference.charDbId,
          reference.scope === "chat" ? reference.chatDbId : "",
          reference.origin,
          "ready"
        ];
        result.rows.__stsh_targets.push(row);
        result.insertTargets.push(row);
        result.recordChanges++;
        result.reasons.push({ code: "restore-target", object: "__stsh_targets" });
      } else if (targetsTableMissing)
        unresolvedMissingTarget = true;
    }
    if (unresolvedMissingTarget)
      return block("invalid-record", "__stsh_targets");
    return result;
  }
  function classifyManagementRepair(changes, counts, facts) {
    const result = {
      ...changes,
      replaceTables: [...changes.replaceTables],
      reasons: [...changes.reasons],
      recreateObjects: [],
      kind: "none"
    };
    const block = (code, object) => ({
      ...result,
      kind: "blocked",
      reasons: [...result.reasons, { code, ...object ? { object } : {} }]
    });
    for (const name of Object.keys(MANAGEMENT_COLUMNS)) {
      const before = counts.before.get(name), after = name === "__stsh_meta" ? counts.meta : result.rows[name].length;
      if (after < before) {
        result.recordChanges += before - after;
        result.replaceTables.push(name);
        result.reasons.push({ code: "merge-duplicates", object: name });
      }
    }
    if (counts.restoredParents) {
      result.recordChanges += counts.restoredParents;
      result.replaceTables.push("__stsh_chats");
      result.reasons.push({ code: "restore-parent", object: "__stsh_chats" });
    }
    if (counts.versionChanged) {
      result.reasons.push({ code: "repair-version", object: "__stsh_meta" });
    }
    if (result.replaceTables.includes("__stsh_roles"))
      result.replaceTables.push("__stsh_chats");
    result.replaceTables = [...new Set(result.replaceTables)];
    for (const name of result.replaceTables) {
      if (facts.tables[name]?.columns.some((column) => !MANAGEMENT_COLUMNS[name].includes(column)))
        return block("extra-columns", name);
      const dependency = facts.externalForeignKeys.find((item) => item.parent === name);
      if (dependency)
        return block("external-foreign-key", dependency.table);
      result.reasons.push({ code: "rebuild-table", object: name });
    }
    const definitions = facts.objects.filter((object) => object.expectedType && object.expectedType !== "table");
    for (const object of definitions) {
      if (object.type && object.type !== object.expectedType)
        return block("object-kind", object.name);
      if (!object.matches || result.replaceTables.includes(object.table) || result.replaceTables.length && object.expectedType === "view") {
        result.recreateObjects.push(object.name);
        result.reasons.push({ code: "repair-object", object: object.name });
      }
    }
    result.kind = result.replaceTables.length ? "rebuild" : result.recreateObjects.length || counts.versionChanged || result.insertTargets.length ? "light" : "none";
    return result;
  }

  // src/worker/management-repair.ts
  var quote2 = (name) => `"${name.replaceAll('"', '""')}"`;
  var specs = SCHEMA6.map((sql) => ({
    sql,
    name: sql.split(" ")[sql.startsWith("CREATE UNIQUE") ? 3 : 2],
    type: sql.includes(" VIEW ") ? "view" : sql.includes(" INDEX ") ? "index" : "table"
  }));
  var tableNames = Object.keys(MANAGEMENT_COLUMNS);
  async function readManagementRepairFacts(root) {
    const facts = {
      objects: [],
      tables: {},
      unreadable: [],
      externalForeignKeys: [],
      sequences: {},
      targetFiles: [],
      recordChecks: [],
      diagnostics: []
    };
    try {
      if (root.availability !== "ready")
        throw Error("unavailable");
      await root.assertFileExisting();
      const objects = (await root.query({ sql: "SELECT name,type,tbl_name,sql FROM sqlite_master ORDER BY type,name" })).rows;
      facts.objects = objects.map((row) => ({
        name: String(row[0]),
        type: String(row[1]),
        table: String(row[2]),
        sql: row[3] === null ? null : String(row[3])
      }));
      for (const spec of specs) {
        const object = facts.objects.find((item) => item.name === spec.name);
        if (object) {
          object.expectedType = spec.type;
          object.matches = object.type === spec.type && object.sql !== null && sameDefinition(object.sql, spec.sql);
        } else
          facts.objects.push({
            name: spec.name,
            type: "",
            table: spec.type === "index" ? spec.sql.match(/ ON (\w+)/)?.[1] ?? "" : spec.name,
            sql: null,
            expectedType: spec.type,
            matches: false
          });
      }
      if (!objects.some((row) => String(row[0]).startsWith("__stsh_") || String(row[0]).startsWith("__st_sle_helper_")))
        facts.objects = facts.objects.filter((item) => item.type);
      for (const name of tableNames) {
        if (!facts.objects.some((item) => item.name === name && item.type === "table"))
          continue;
        try {
          const columns = (await root.query({ sql: "SELECT name FROM pragma_table_xinfo(?) ORDER BY cid", binds: [name] })).rows.map((row) => String(row[0]));
          const rows = (await root.query({ sql: `SELECT ${columns.map(quote2).join(",")} FROM ${quote2(name)}` })).rows;
          rows.sort((a, b) => managementValueKey(a).localeCompare(managementValueKey(b)));
          facts.tables[name] = { columns, rows };
        } catch (error) {
          facts.unreadable.push(name);
          facts.diagnostics.push({ object: name, error: errorData(error) });
        }
      }
      for (const object of facts.objects.filter((item) => item.type === "table" && !tableNames.includes(item.name) && !item.name.startsWith("sqlite_"))) {
        const refs = (await root.query({ sql: 'SELECT "table" FROM pragma_foreign_key_list(?)', binds: [object.name] })).rows;
        for (const row of refs)
          if (tableNames.includes(String(row[0])))
            facts.externalForeignKeys.push({ table: object.name, parent: String(row[0]) });
      }
      if (objects.some((row) => row[0] === "sqlite_sequence")) {
        const rows = (await root.query({ sql: "SELECT name,seq FROM sqlite_sequence WHERE name IN ('__stsh_roles','__stsh_chats')" })).rows;
        for (const [name, value] of rows) {
          if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0) {
            facts.unreadable.push("sqlite_sequence");
            continue;
          }
          const key = name;
          facts.sequences[key] = Math.max(facts.sequences[key] ?? 0, value);
        }
      }
    } catch (error) {
      facts.unreadable.push("global.sqlite");
      facts.diagnostics.push({ object: "global.sqlite", error: errorData(error) });
    }
    return facts;
  }
  async function digest(value) {
    return sha2562(new TextEncoder().encode(managementValueKey(value)));
  }
  async function inspect(root, options) {
    const facts = await readManagementRepairFacts(root);
    let decision = decideManagementRepair(facts);
    for (const record of decision.recordsToCheck) {
      const observation = options.observations?.find((item) => item.scope === record.scope && item.referenceId === record.referenceId && item.avatar === record.avatar && item.file === record.file && ["same", "deleted", "unknown"].includes(item.status));
      let files = "unknown";
      if (observation?.status === "unknown" && observation.reason)
        facts.diagnostics.push({
          object: `${record.scope === "char" ? "__stsh_roles" : "__stsh_chats"}:${record.referenceId}`,
          error: { code: "LOAD_FAILED", message: observation.reason }
        });
      if (observation && observation.status !== "unknown" && options.readRecordFiles) {
        try {
          files = await options.readRecordFiles(record);
        } catch (error) {
          facts.diagnostics.push({
            object: `${record.scope === "char" ? "__stsh_roles" : "__stsh_chats"}:${record.referenceId}`,
            error: errorData(error)
          });
        }
      }
      facts.recordChecks.push({ record, ...observation ? { observation: { ...observation } } : {}, files });
    }
    const readTargets = async () => {
      decision = decideManagementRepair(facts);
      for (const target of decision.targetsToCheck) {
        if (facts.targetFiles.some((item) => managementValueKey(item.target) === managementValueKey(target)))
          continue;
        let state = "unknown";
        if (options.readTarget)
          try {
            const database = await options.readTarget(target), result = classifyScanDatabase(database, target.origin);
            if (database.status === "unknown" && database.reason)
              facts.diagnostics.push({
                object: database.relativePath,
                error: { code: "LOAD_FAILED", message: database.reason }
              });
            state = result === "usable" ? "ready" : result === "missing" ? "missing" : result === "needs-repair" ? "needs-repair" : "unknown";
          } catch (error) {
            facts.diagnostics.push({ object: databasePath(target.charDbId, target.chatDbId), error: errorData(error) });
          }
        facts.targetFiles.push({ target, state });
      }
    };
    await readTargets();
    await readTargets();
    decision = decideManagementRepair(facts);
    const plan = {
      kind: decision.kind,
      evidence: await digest(facts),
      objects: [
        ...new Set([
          ...decision.replaceTables,
          ...decision.recreateObjects,
          ...decision.insertTargets.length ? ["__stsh_targets"] : []
        ])
      ],
      reasons: decision.reasons,
      recordChanges: decision.recordChanges,
      ...decision.recordsToCheck.length ? { recordsToCheck: decision.recordsToCheck } : {},
      ...facts.diagnostics?.length ? { diagnostics: facts.diagnostics } : {}
    };
    return { facts, decision, plan };
  }
  async function inspectManagementRepair(root, options = {}) {
    return (await inspect(root, options)).plan;
  }
  function check(sql, binds = []) {
    return { sql: `INSERT INTO temp.__stsh_repair_guard(value) SELECT CASE WHEN (${sql}) THEN 1 ELSE 0 END`, binds };
  }
  function rowChecks(name, columns, rows) {
    const groups = new Map;
    for (const row of rows) {
      const key = managementValueKey(row), old = groups.get(key);
      if (old)
        old.count++;
      else
        groups.set(key, { row, count: 1 });
    }
    return [
      check(`SELECT count(*)=? FROM ${name}`, [rows.length]),
      ...Array.from(groups.values(), ({ row, count }) => check(`SELECT count(*)=? FROM ${name} WHERE ${columns.map((column) => `typeof(${quote2(column)})=typeof(?) AND quote(${quote2(column)})=quote(?) COLLATE BINARY`).join(" AND ")}`, [count, ...row.flatMap((value) => [value, value])]))
    ];
  }
  function commandsFor(facts, decision) {
    const commands = [{ sql: "CREATE TEMP TABLE __stsh_repair_guard(value INTEGER NOT NULL CHECK(value=1))" }];
    const actual = facts.objects.filter((object) => object.type);
    commands.push(check("SELECT count(*)=? FROM sqlite_master", [actual.length]));
    for (const object of actual)
      commands.push(check("SELECT count(*)=1 FROM sqlite_master WHERE name=? AND type=? AND tbl_name=? AND sql IS ?", [
        object.name,
        object.type,
        object.table,
        object.sql
      ]));
    for (const name of tableNames)
      if (facts.tables[name])
        commands.push(...rowChecks(quote2(name), facts.tables[name].columns, facts.tables[name].rows));
    const replacement = new Set(decision.replaceTables);
    const tempName = (name) => `${name}_repair_copy`;
    const create = (name, temporary) => {
      let sql = specs.find((spec) => spec.name === name).sql;
      if (temporary) {
        sql = sql.replace(`CREATE TABLE ${name} `, `CREATE TABLE ${quote2(tempName(name))} `);
        if (name === "__stsh_chats" && replacement.has("__stsh_roles"))
          sql = sql.replace("REFERENCES __stsh_roles(role_id)", `REFERENCES ${quote2(tempName("__stsh_roles"))}(role_id)`);
      }
      return { sql };
    };
    for (const name of tableNames)
      if (replacement.has(name)) {
        commands.push(create(name, true));
        for (const row of decision.rows[name])
          commands.push({
            sql: `INSERT INTO ${quote2(tempName(name))}(${MANAGEMENT_COLUMNS[name].map(quote2).join(",")}) VALUES(${row.map(() => "?").join(",")})`,
            binds: row
          });
        commands.push(...rowChecks(quote2(tempName(name)), MANAGEMENT_COLUMNS[name], decision.rows[name]));
      }
    const recreate = new Set(decision.recreateObjects);
    for (const object of facts.objects)
      if (object.expectedType === "view" && (replacement.size || recreate.has(object.name)) && object.type === "view")
        commands.push({ sql: `DROP VIEW ${quote2(object.name)}` });
    const extensions = facts.objects.filter((object) => !object.expectedType && object.sql && ["index", "trigger"].includes(object.type) && replacement.has(object.table));
    for (const name of [...tableNames].reverse())
      if (replacement.has(name) && facts.objects.some((object) => object.name === name && object.type === "table"))
        commands.push({ sql: `DROP TABLE ${quote2(name)}` });
    for (const name of tableNames)
      if (replacement.has(name)) {
        commands.push(create(name, false), {
          sql: `INSERT INTO ${quote2(name)}(${MANAGEMENT_COLUMNS[name].map(quote2).join(",")}) SELECT ${MANAGEMENT_COLUMNS[name].map(quote2).join(",")} FROM ${quote2(tempName(name))}`
        });
        commands.push(...rowChecks(quote2(name), MANAGEMENT_COLUMNS[name], decision.rows[name]));
      }
    for (const name of ["__stsh_roles", "__stsh_chats"])
      if (replacement.has(name) && facts.sequences[name] !== undefined) {
        const value = facts.sequences[name];
        commands.push({ sql: "UPDATE sqlite_sequence SET seq=MAX(seq,?) WHERE name=?", binds: [value, name] }, {
          sql: "INSERT INTO sqlite_sequence(name,seq) SELECT ?,? WHERE NOT EXISTS(SELECT 1 FROM sqlite_sequence WHERE name=?)",
          binds: [name, value, name]
        });
      }
    for (const spec of specs)
      if (spec.type !== "table" && (recreate.has(spec.name) || replacement.size && spec.type === "view")) {
        const object = facts.objects.find((object) => object.name === spec.name);
        if (spec.type === "index" && object?.type === "index" && !replacement.has(object.table))
          commands.push({ sql: `DROP INDEX ${quote2(spec.name)}` });
        commands.push({ sql: spec.sql });
      }
    for (const extension of extensions)
      commands.push({ sql: extension.sql });
    if (!replacement.has("__stsh_targets"))
      for (const row of decision.insertTargets)
        commands.push({
          sql: "INSERT INTO __stsh_targets(scope,char_dbid,chat_dbid,origin,state) VALUES(?,?,?,?,?)",
          binds: row
        });
    if (!replacement.has("__stsh_meta") && decision.reasons.some((reason) => reason.code === "repair-version"))
      commands.push({ sql: "INSERT OR REPLACE INTO __stsh_meta(key,value) VALUES('schema_version','6')" });
    commands.push(check(`SELECT count(*)=0 FROM pragma_foreign_key_check WHERE "table" IN ('__stsh_roles','__stsh_chats','__stsh_targets','__stsh_meta')`));
    for (const name of [...tableNames].reverse())
      if (replacement.has(name))
        commands.push({ sql: `DROP TABLE ${quote2(tempName(name))}` });
    commands.push({ sql: "DROP TABLE temp.__stsh_repair_guard" });
    return commands;
  }
  async function applyManagementRepair(root, expected, options = {}) {
    const current = await inspect(root, options);
    if (current.plan.evidence !== expected?.evidence)
      return { status: "skipped", plan: current.plan };
    if (current.plan.kind === "blocked")
      return { status: "blocked", plan: current.plan };
    if (current.plan.kind === "none")
      return { status: "unchanged", plan: current.plan };
    await root.transaction(commandsFor(current.facts, current.decision), undefined, { management: true });
    const saved = await readManagementRepairFacts(root), schema = await inspectSchema6(root);
    if (schema.state !== "valid")
      throw new ServiceError({
        code: "RESULT_UNCONFIRMED",
        resultState: "unconfirmed",
        message: "管理库已提交，但结构读回未通过。请重新扫描。"
      });
    for (const name of tableNames) {
      const rows = saved.tables[name].rows.map((row) => MANAGEMENT_COLUMNS[name].map((column) => row[saved.tables[name].columns.indexOf(column)]));
      const expectedRows = current.decision.rows[name];
      if (managementValueKey(rows.map(managementValueKey).sort()) !== managementValueKey(expectedRows.map(managementValueKey).sort()))
        throw new ServiceError({
          code: "RESULT_UNCONFIRMED",
          resultState: "unconfirmed",
          message: "管理库已保存，但保留记录读回不一致。请重新扫描。"
        });
    }
    return { status: "repaired", plan: (await inspect(root, options)).plan };
  }

  // src/database-maintenance-rules.ts
  function decideDatabaseMaintenance(target, snapshot, database, repair, observations = []) {
    const records = snapshot.records.filter((r) => r.scope === target.scope && r.id?.toLowerCase() === (target.scope === "chat" ? target.chatDbId : target.charDbId).toLowerCase() && (target.scope === "char" || r.parent?.toLowerCase() === target.charDbId.toLowerCase()));
    const plan = {
      kind: "blocked",
      target,
      relativePath: databasePath(target.charDbId, target.scope === "chat" ? target.chatDbId : undefined),
      records,
      reasons: [],
      loss: [],
      file: database.status === "missing" ? "missing" : database.status === "checked" || database.failure === "database" ? "present" : "unknown",
      ...repair ? { scopedRepair: repair } : {}
    };
    const block = (code) => {
      plan.reasons = [{ code }];
      return plan;
    };
    if (snapshot.management !== "valid")
      return block("management-unavailable");
    const identities = [
      ...database.identity && database.identity !== "invalid" ? [database.identity] : [],
      ...repair?.identities ?? []
    ];
    if (identities.some((identity) => snapshot.records.some((r) => r.confirmed && r.state !== "deleted" && r.scope === identity.scope && r.id === (identity.scope === "chat" ? identity.chatDbId : identity.charDbId) && (r.scope === "char" || r.parent === identity.charDbId)) && (identity.scope !== target.scope || identity.charDbId !== target.charDbId || (identity.chatDbId ?? "") !== (target.scope === "chat" ? target.chatDbId : ""))))
      return block("identity-owned-elsewhere");
    if (database.status === "checked" && repair?.kind === "none") {
      plan.kind = "none";
      return plan;
    }
    if (!records.length || !records.some((r) => r.state !== "deleted" && r.confirmed))
      return block("owner-unconfirmed");
    if (records.some((r) => r.state !== "deleted" && !observations.some((o) => o.scope === r.scope && o.referenceId === r.referenceId && o.avatar === r.avatar && o.file === r.file && o.status === "same" && (r.scope === "char" || o.observedId === r.id))))
      return block("owner-readback-required");
    if (database.status === "unknown" && database.failure !== "database")
      return block("file-unreadable");
    const registration = snapshot.targets.find((t) => t.scope === target.scope && t.charDbId === target.charDbId && (t.chatDbId ?? "") === (target.scope === "chat" ? target.chatDbId : ""));
    if (database.status === "missing" && registration?.origin === "generated" && registration.state === "never") {
      plan.kind = "none";
      return plan;
    }
    const lostMetadata = repair?.kind === "blocked" && repair.reasons.length > 0 && repair.reasons.every((reason) => ["metadata-columns-unavailable", "metadata-value-unavailable", "metadata-conflict", "object-kind"].includes(reason.code));
    if (database.status === "missing" || database.failure === "database" || repair?.kind === "reset-required" || lostMetadata) {
      plan.kind = "reset";
      plan.reasons = repair?.reasons ?? [{ code: database.status === "missing" ? "file-missing" : "file-damaged" }];
      plan.loss = [
        target.scope === "chat" ? "该聊天库中的全部插件业务数据和历史状态将重新开始；共用这份数据的聊天一起受影响，酒馆消息不变。" : "这份角色库中的插件业务数据将重新开始；其下聊天库和酒馆消息不变。"
      ];
      return plan;
    }
    plan.kind = repair?.kind === "repair" ? "repair" : repair?.kind === "none" ? "none" : "blocked";
    plan.reasons = repair?.reasons ?? [{ code: "file-unreadable" }];
    if (repair?.diagnostics?.length)
      plan.diagnostics = repair.diagnostics;
    return plan;
  }

  // src/global-reconstruction-rules.ts
  var text2 = (v) => typeof v === "string" && !!v && !v.includes("\x00") && v.length <= 4096;
  var integer2 = (v, minimum) => typeof v === "number" && Number.isSafeInteger(v) && v >= minimum;
  function unambiguousRows(rows, key) {
    const groups = new Map;
    for (const row of rows) {
      const k = key(row), group = groups.get(k) ?? [];
      if (!group.some((old) => managementValueKey(old) === managementValueKey(row)))
        group.push(row);
      groups.set(k, group);
    }
    let lost = 0;
    const retained = [...groups.values()].flatMap((group) => {
      if (group.length === 1)
        return group;
      lost += group.length;
      return [];
    });
    return { rows: retained, lost };
  }
  function recoverGlobalRoles(input) {
    let lost = 0;
    const validRows = input.roles.map((row) => [...row]).filter((r) => {
      if (!isUuid(r[2])) {
        const children = input.chats.filter((chat) => chat[1] === r[0]), parents = new Set(children.map((chat) => chat[4]).filter(isUuid));
        if (children.length && parents.size === 1 && children.every((chat) => isUuid(chat[4])))
          r[2] = [...parents][0];
      }
      const valid = integer2(r[0], 1) && text2(r[1]) && (r[2] === null && !input.identityColumnMissing || isUuid(r[2])) && integer2(r[3], 0) && typeof r[4] === "number" && [0, 1].includes(r[4]) && ["generated", "legacy"].includes(String(r[5])) && ["active", "deleted"].includes(String(r[6])) && (r[3] !== 0 || r[2] === null && r[4] === 0);
      if (!valid)
        lost++;
      return valid;
    });
    const ids = unambiguousRows(validRows, (row) => String(row[0])), values = new Map, redirect = new Map;
    for (const row of ids.rows.sort((a, b) => Number(a[0]) - Number(b[0]))) {
      const key = managementValueKey(row.slice(1)), same = values.get(key);
      if (same)
        redirect.set(row[0], same[0]);
      else
        values.set(key, row);
    }
    const coordinates = unambiguousRows([...values.values()], (row) => row[6] === "active" ? String(row[1]) : `deleted:${row[0]}`);
    return { rows: coordinates.rows, redirect, lost: lost + ids.lost + coordinates.lost };
  }
  function recoverGlobalChats(input) {
    let lost = 0;
    const validRows = input.chats.map((row) => [...row]).filter((r) => {
      if (typeof r[1] === "number")
        r[1] = input.roleRedirect.get(r[1]) ?? r[1];
      let parent = input.roles.find((role) => role[0] === r[1]);
      if (!parent && isUuid(r[4])) {
        const candidates = input.roles.filter((role) => role[2] === r[4]);
        if (candidates.length === 1) {
          parent = candidates[0];
          r[1] = parent[0];
        }
      }
      if (parent && input.parentColumnMissing && isUuid(parent[2]))
        r[4] = parent[2];
      const valid = integer2(r[0], 1) && integer2(r[1], 1) && text2(r[2]) && (r[3] === null && !input.identityColumnMissing || isUuid(r[3])) && isUuid(r[4]) && integer2(r[5], 1) && typeof r[6] === "number" && [0, 1].includes(r[6]) && ["generated", "legacy"].includes(String(r[7])) && ["active", "retained", "deleted"].includes(String(r[8])) && parent?.[2] === r[4];
      if (!valid)
        lost++;
      return valid;
    });
    const ids = unambiguousRows(validRows, (row) => String(row[0])), values = new Map;
    for (const row of ids.rows.sort((a, b) => Number(a[0]) - Number(b[0]))) {
      const key = managementValueKey(row.slice(1));
      if (!values.has(key))
        values.set(key, row);
    }
    const coordinates = unambiguousRows([...values.values()], (row) => row[8] === "deleted" ? `deleted:${row[0]}` : managementValueKey([row[1], row[2]]));
    return { rows: coordinates.rows, lost: lost + ids.lost + coordinates.lost };
  }
  function reconstructGlobalRecords(facts, discovery) {
    const result = {
      blocked: [],
      rows: { __stsh_meta: [], __stsh_targets: [], __stsh_roles: [], __stsh_chats: [] },
      lost: 0
    };
    if (facts?.unreadable.length) {
      result.blocked.push("file-unreadable");
      return result;
    }
    if (discovery && !discovery.complete)
      result.blocked.push("discovery-incomplete");
    if (facts?.externalForeignKeys.length)
      result.blocked.push("external-foreign-key");
    if (facts?.objects.some((o) => o.name.startsWith("__st_sle_helper_")))
      result.blocked.push("legacy-format");
    if (facts?.objects.some((o) => o.name.startsWith("__stsh_") && !o.expectedType && !["index", "trigger"].includes(o.type)))
      result.blocked.push("unknown-management-object");
    const project = (name) => {
      const table = facts?.tables[name];
      if (!table)
        return [];
      return table.rows.map((row) => MANAGEMENT_COLUMNS[name].map((c) => row[table.columns.indexOf(c)] ?? null));
    };
    const unique = (rows, key) => {
      const decision = unambiguousRows(rows, key);
      result.lost += decision.lost;
      return decision.rows;
    };
    const meta = project("__stsh_meta");
    const versions = meta.filter((r) => r[0] === "schema_version").map((r) => r[1]);
    if (versions.some((value) => {
      try {
        const version = typeof value === "string" ? JSON.parse(value) : value;
        return typeof version === "number" && Number.isSafeInteger(version) && version >= 0 && version !== 6;
      } catch {
        return false;
      }
    }))
      result.blocked.push("unknown-version");
    result.rows.__stsh_meta = unique(meta.filter((r) => {
      const valid = text2(r[0]) && typeof r[1] === "string";
      if (!valid)
        result.lost++;
      return valid && r[0] !== "schema_version";
    }), (r) => String(r[0]));
    result.rows.__stsh_meta.push(["schema_version", "6"]);
    const rawChats = project("__stsh_chats"), rawRoles = project("__stsh_roles");
    const roles = recoverGlobalRoles({
      roles: rawRoles,
      chats: rawChats,
      identityColumnMissing: !!facts?.tables.__stsh_roles && !facts.tables.__stsh_roles.columns.includes("char_dbid")
    });
    result.rows.__stsh_roles = roles.rows;
    const chats = recoverGlobalChats({
      chats: rawChats,
      roles: roles.rows,
      roleRedirect: roles.redirect,
      identityColumnMissing: !!facts?.tables.__stsh_chats && !facts.tables.__stsh_chats.columns.includes("chat_dbid"),
      parentColumnMissing: !facts?.tables.__stsh_chats?.columns.includes("parent_char_dbid")
    });
    result.rows.__stsh_chats = chats.rows;
    result.lost += roles.lost + chats.lost;
    let roleId = Math.max(facts?.sequences.__stsh_roles ?? 0, ...rawRoles.map((r) => integer2(r[0], 1) ? r[0] : 0), 0);
    let chatId = Math.max(facts?.sequences.__stsh_chats ?? 0, ...rawChats.map((r) => integer2(r[0], 1) ? r[0] : 0), 0);
    const matches = discovery?.matches ?? [];
    for (const match of matches) {
      if (!text2(match.avatar) || !text2(match.file) || !isUuid(match.parent) || !isUuid(match.chatId) || match.observedId !== match.chatId || match.rolePresent === false)
        continue;
      if (matches.some((m) => m.avatar === match.avatar && (m.parent !== match.parent || m.file === match.file && m.chatId !== match.chatId)))
        continue;
      let role = result.rows.__stsh_roles.find((r) => r[1] === match.avatar && r[6] === "active");
      if (role && role[2] !== match.parent)
        continue;
      if (!role && match.rolePresent !== true)
        continue;
      if (!role) {
        role = [++roleId, match.avatar, match.parent, 1, 1, "legacy", "active"];
        result.rows.__stsh_roles.push(role);
      }
      if (!result.rows.__stsh_chats.some((r) => r[1] === role[0] && r[2] === match.file && r[8] !== "deleted"))
        result.rows.__stsh_chats.push([
          ++chatId,
          role[0],
          match.file,
          match.chatId,
          match.parent,
          1,
          1,
          "legacy",
          "active"
        ]);
    }
    const targets = project("__stsh_targets").filter((r) => ["char", "chat"].includes(String(r[0])) && isUuid(r[1]) && (r[0] === "char" ? r[2] === "" : isUuid(r[2])) && ["generated", "legacy"].includes(String(r[3])) && ["never", "creating", "ready"].includes(String(r[4])));
    result.rows.__stsh_targets = unique(targets, (r) => managementValueKey(r.slice(0, 3)));
    for (const file of facts?.targetFiles ?? []) {
      if (file.state !== "ready" && file.state !== "needs-repair")
        continue;
      const t = file.target;
      const generated = t.origin === "generated" || result.rows.__stsh_roles.some((row) => t.scope === "char" && row[2] === t.charDbId && row[5] === "generated") || result.rows.__stsh_chats.some((row) => t.scope === "chat" && row[4] === t.charDbId && row[3] === t.chatDbId && row[7] === "generated");
      if (!result.rows.__stsh_targets.some((r) => r[0] === t.scope && r[1] === t.charDbId && r[2] === (t.chatDbId ?? "")))
        result.rows.__stsh_targets.push([
          t.scope,
          t.charDbId,
          t.chatDbId ?? "",
          generated ? "generated" : "legacy",
          "ready"
        ]);
    }
    if (!Number.isSafeInteger(roleId + 1) || !Number.isSafeInteger(chatId + 1))
      result.blocked.push("reference-id-exhausted");
    return result;
  }

  // src/worker/global-reconstruction.ts
  var quote3 = (v) => `"${v.replaceAll('"', '""')}"`;
  function reconstructionRecords(decision) {
    const roles = decision.rows.__stsh_roles;
    return [
      ...roles.map((r) => ({
        scope: "char",
        referenceId: Number(r[0]),
        avatar: String(r[1]),
        id: r[2],
        generation: Number(r[3]),
        confirmed: r[4] === 1,
        origin: r[5],
        state: r[6],
        taskReasons: [],
        parentDependency: false,
        shared: false
      })),
      ...decision.rows.__stsh_chats.map((r) => ({
        scope: "chat",
        referenceId: Number(r[0]),
        parentReferenceId: Number(r[1]),
        avatar: String(roles.find((role) => role[0] === r[1])[1]),
        file: String(r[2]),
        id: r[3],
        parent: String(r[4]),
        generation: Number(r[5]),
        confirmed: r[6] === 1,
        origin: r[7],
        state: r[8],
        taskReasons: [],
        parentDependency: false,
        shared: false
      }))
    ];
  }
  function reconstructionCommands(decision, facts) {
    if (decision.blocked.length)
      throw Error("管理登记仍有无法确定的依赖，未开始重建。");
    const commands = [];
    const owned = new Set(SCHEMA6.map((sql) => sql.split(" ")[sql.startsWith("CREATE UNIQUE") ? 3 : 2]));
    for (const object of facts?.objects ?? [])
      if (owned.has(object.name) && object.type && object.type !== "table")
        commands.push({ sql: `DROP ${object.type.toUpperCase()} ${quote3(object.name)}` });
    for (const name of ["__stsh_chats", "__stsh_roles", "__stsh_targets", "__stsh_meta"]) {
      const object = facts?.objects.find((o) => o.name === name && o.type);
      if (object)
        commands.push({ sql: `DROP ${object.type.toUpperCase()} ${quote3(name)}` });
    }
    commands.push(...SCHEMA6.map((sql) => ({ sql })));
    for (const [name, rows] of Object.entries(decision.rows))
      for (const row of rows)
        commands.push({
          sql: `INSERT INTO ${quote3(name)}(${MANAGEMENT_COLUMNS[name].map(quote3).join(",")}) VALUES(${row.map(() => "?").join(",")})`,
          binds: row
        });
    for (const object of facts?.objects ?? [])
      if (!owned.has(object.name) && Object.hasOwn(MANAGEMENT_COLUMNS, object.table) && ["index", "trigger"].includes(object.type) && object.sql)
        commands.push({ sql: object.sql });
    for (const [name, value] of Object.entries(facts?.sequences ?? {}))
      commands.push({ sql: "UPDATE sqlite_sequence SET seq=max(seq,?) WHERE name=?", binds: [value, name] }, {
        sql: "INSERT INTO sqlite_sequence(name,seq) SELECT ?,? WHERE NOT EXISTS(SELECT 1 FROM sqlite_sequence WHERE name=?)",
        binds: [name, value, name]
      });
    return commands;
  }
  async function readPreservedGlobal(root) {
    const owned = new Set(SCHEMA6.map((sql) => sql.split(" ")[sql.startsWith("CREATE UNIQUE") ? 3 : 2]));
    const objects = (await root.query({ sql: "SELECT name,type,sql FROM sqlite_master ORDER BY name" })).rows.filter((row) => !owned.has(String(row[0])) && !String(row[0]).startsWith("sqlite_") && row[2] !== null);
    const tables = [];
    for (const object of objects.filter((row) => row[1] === "table")) {
      const name = String(object[0]), columns = (await root.query({ sql: "SELECT name FROM pragma_table_xinfo(?) ORDER BY cid", binds: [name] })).rows.map((row) => String(row[0]));
      tables.push({
        name,
        columns,
        rows: (await root.query({ sql: `SELECT ${columns.map(quote3).join(",")} FROM ${quote3(name)}` })).rows
      });
    }
    return { objects, tables };
  }
  function contentChecks(table) {
    const check = (sql, binds) => ({
      sql: `INSERT INTO temp.__stsh_global_guard(value) SELECT CASE WHEN (${sql}) THEN 1 ELSE 0 END`,
      binds
    });
    const groups = new Map;
    for (const row of table.rows) {
      const key = managementValueKey(row), group = groups.get(key);
      if (group)
        group.count++;
      else
        groups.set(key, { row, count: 1 });
    }
    return [
      check(`SELECT count(*)=? FROM ${quote3(table.name)}`, [table.rows.length]),
      ...[...groups.values()].map(({ row, count }) => check(`SELECT count(*)=? FROM ${quote3(table.name)} WHERE ${table.columns.map((column) => `typeof(${quote3(column)})=typeof(?) AND quote(${quote3(column)})=quote(?) COLLATE BINARY`).join(" AND ")}`, [count, ...row.flatMap((value) => [value, value])]))
    ];
  }
  async function applyGlobalReconstruction(root, facts, discovery, reset, create = false) {
    const decision = reconstructGlobalRecords(facts, discovery);
    const commands = reconstructionCommands(decision, facts);
    const preserved = !reset ? await readPreservedGlobal(root) : undefined;
    if (preserved) {
      const before = [
        ...preserved.tables,
        ...Object.entries(facts?.tables ?? {}).map(([name, table]) => ({
          name,
          columns: table.columns,
          rows: table.rows
        }))
      ];
      commands.unshift({ sql: "CREATE TEMP TABLE __stsh_global_guard(value INTEGER NOT NULL CHECK(value=1))" }, ...before.flatMap(contentChecks));
      commands.push(...preserved.tables.flatMap(contentChecks), { sql: "DROP TABLE temp.__stsh_global_guard" });
    }
    if (reset)
      await root.replaceForMaintenance(commands, create);
    else
      await root.transaction(commands, undefined, { management: true });
    await root.refresh();
    await assertSchema6(root);
    for (const [name, rows] of Object.entries(decision.rows)) {
      const actual = (await root.query({
        sql: `SELECT ${MANAGEMENT_COLUMNS[name].map(quote3).join(",")} FROM ${quote3(name)}`
      })).rows;
      if (managementValueKey(actual.map(managementValueKey).sort()) !== managementValueKey(rows.map(managementValueKey).sort()))
        throw new ServiceError({
          code: "RESULT_UNCONFIRMED",
          resultState: "unconfirmed",
          message: "全局库已保存，但插件登记或设置读回不一致。请重新扫描。"
        });
    }
    if (preserved) {
      const saved = await readPreservedGlobal(root);
      if (managementValueKey(saved.objects) !== managementValueKey(preserved.objects) || managementValueKey(saved.tables.map((table) => ({
        name: table.name,
        columns: table.columns,
        rows: table.rows.map(managementValueKey).sort()
      }))) !== managementValueKey(preserved.tables.map((table) => ({
        name: table.name,
        columns: table.columns,
        rows: table.rows.map(managementValueKey).sort()
      }))))
        throw new ServiceError({
          code: "RESULT_UNCONFIRMED",
          resultState: "unconfirmed",
          message: "全局库已保存，但业务表或用户结构读回不一致。请重新扫描。"
        });
    }
  }

  // src/dvs2/ext/tables/worldbook.ts
  var import_semver = __toESM(require_semver2(), 1);
  function strictVersion(version) {
    const parsed = import_semver.parse(version, { loose: false });
    if (!parsed || `${parsed.version}${parsed.build.length ? `+${parsed.build.join(".")}` : ""}` !== version)
      throw new Error(`DVS DDL 版本必须是完整 SemVer major.minor.patch：${version}`);
    return version;
  }

  // src/dvs2/ids.ts
  function identifierBytes(value) {
    if (!ArrayBuffer.isView(value) || Object.prototype.toString.call(value) !== "[object Uint8Array]" || value.byteLength !== 16)
      throw new Error("DVS 标识必须是 16 字节 BLOB。");
    return new Uint8Array(value);
  }

  // src/scoped-database-repair-rules.ts
  var scopedValueKey = (value) => JSON.stringify(value, (_key, cell) => cell instanceof Uint8Array ? { bytes: Array.from(cell) } : cell);
  var reason = (code, object) => ({ code, ...object ? { object } : {} });
  var sameRows = (a, b) => scopedValueKey(a.map(scopedValueKey).sort()) === scopedValueKey(b.map(scopedValueKey).sort());
  var project = (table, columns) => columns.every((column) => table.columns.includes(column)) ? table.rows.map((row) => columns.map((column) => row[table.columns.indexOf(column)])) : table.rows.length ? undefined : [];
  var unique = (rows) => [...new Map(rows.map((row) => [scopedValueKey(row), row])).values()];
  function helperMetadataIdentities(table) {
    const identities = new Map;
    for (const row of table ? project(table, ["key", "value"]) ?? [] : []) {
      if (row[0] !== "identity" || typeof row[1] !== "string")
        continue;
      try {
        const value = JSON.parse(row[1]);
        if (!value || typeof value !== "object" || !isUuid(value.charDbId))
          continue;
        let identity;
        if (value.scope === "char" && value.chatDbId === undefined)
          identity = { scope: "char", charDbId: value.charDbId };
        else if (value.scope === "chat" && isUuid(value.chatDbId))
          identity = { scope: "chat", charDbId: value.charDbId, chatDbId: value.chatDbId };
        else
          continue;
        identities.set(scopedValueKey(identity), identity);
      } catch {}
    }
    return [...identities.values()].sort((a, b) => scopedValueKey(a).localeCompare(scopedValueKey(b)));
  }
  var validIdentifier = (value) => {
    try {
      identifierBytes(value);
      return true;
    } catch {
      return false;
    }
  };
  function decideHelperMetadata(table, identity) {
    const expected = JSON.stringify(identity);
    if (!table)
      return { kind: "repair", rows: [["identity", expected]], reasons: [reason("restore-identity", "__stsh_meta")] };
    const rows = project(table, ["key", "value"]);
    if (!rows)
      return { kind: "blocked", rows: [], reasons: [reason("metadata-columns-unavailable", table.name)] };
    const values = new Map, nullKeys = [];
    for (const row of rows) {
      if (row[0] !== null && typeof row[0] !== "string" || typeof row[1] !== "string")
        return { kind: "blocked", rows: [], reasons: [reason("metadata-value-unavailable", table.name)] };
      if (row[0] === null) {
        nullKeys.push(row);
        continue;
      }
      const old = values.get(row[0]);
      if (old && old[1] !== row[1]) {
        if (row[0] !== "identity")
          return { kind: "blocked", rows: [], reasons: [reason("metadata-conflict", table.name)] };
        values.set("identity", ["identity", expected]);
      } else
        values.set(row[0], row);
    }
    const old = values.get("identity");
    let parsed;
    try {
      const value = old ? JSON.parse(old[1]) : undefined;
      if (value && typeof value === "object" && !Array.isArray(value))
        parsed = value;
    } catch {}
    const matches = parsed?.scope === identity.scope && parsed.charDbId === identity.charDbId && parsed.chatDbId === identity.chatDbId;
    if (!matches) {
      const next = { ...parsed, ...identity };
      if (identity.scope === "char")
        delete next.chatDbId;
      values.set("identity", ["identity", JSON.stringify(next)]);
    }
    const retained = [...values.values(), ...nullKeys];
    const changed = !table.matches || !sameRows(rows, retained);
    return {
      kind: changed ? "repair" : "none",
      rows: retained,
      reasons: changed ? [reason("restore-identity", table.name)] : []
    };
  }
  function decideDvsVersion(table) {
    const rows = table ? project(table, ["singleton", "version"]) : undefined;
    if (!rows?.length)
      return { kind: "reset-required", rows: [], reasons: [reason("dvs-version-lost", "_dvs_version")] };
    const versions = new Set;
    for (const row of rows) {
      try {
        if (typeof row[1] !== "string")
          throw Error();
        strictVersion(row[1]);
        versions.add(row[1]);
      } catch {
        return { kind: "reset-required", rows: [], reasons: [reason("dvs-version-lost", "_dvs_version")] };
      }
    }
    if (versions.size !== 1)
      return { kind: "reset-required", rows: [], reasons: [reason("dvs-version-conflict", "_dvs_version")] };
    const retained = [[1, [...versions][0]]], changed = !table.matches || !sameRows(rows, retained);
    return {
      kind: changed ? "repair" : "none",
      rows: retained,
      reasons: changed ? [reason("rebuild-dvs-table", "_dvs_version")] : []
    };
  }
  function decideDvsCounter(table) {
    const rows = table ? project(table, ["singleton", "successful_updates"]) : undefined;
    const valid = rows?.every((row) => row[0] === 1 && typeof row[1] === "number" && Number.isSafeInteger(row[1]) && row[1] >= 0);
    const distinct = rows ? unique(rows) : [];
    const retained = valid && distinct.length === 1 ? distinct : [[1, 0]];
    const changed = !table?.matches || !rows || !sameRows(rows, retained);
    return {
      kind: changed ? "repair" : "none",
      rows: retained,
      reasons: changed ? [reason(valid && distinct.length === 1 ? "rebuild-dvs-table" : "reset-gc-counter", "_dvs_gc_counter")] : []
    };
  }
  function normalizeDvsIndex(rows, entities) {
    const rids = new Set(entities.rids.filter(validIdentifier).map(scopedValueKey));
    const retained = unique(rows.filter((row) => validIdentifier(row[0]) && validIdentifier(row[1]) && (entities.state !== "known" || rids.has(scopedValueKey(row[1])))));
    return { rows: retained, removed: rows.length - retained.length };
  }
  function decideDvsTables(facts) {
    const result = { kind: "none", repairs: [], reasons: [] };
    const dvs = facts.objects.filter((object) => object.name.startsWith("_dvs_"));
    if (!dvs.length)
      return result;
    if (dvs.some((object) => object.type === "table" && !["_dvs_version", "_dvs_gc_counter"].includes(object.name) && !object.name.startsWith("_dvs_index_")))
      return { kind: "blocked", repairs: [], reasons: [reason("unknown-dvs-structure")] };
    for (const name of facts.expectedIndexes)
      if (!facts.tables.some((table) => table.name === name))
        return { kind: "reset-required", repairs: [], reasons: [reason("dvs-index-history-lost", name)] };
    for (const [name, columns, decide] of [
      ["_dvs_version", ["singleton", "version"], decideDvsVersion],
      ["_dvs_gc_counter", ["singleton", "successful_updates"], decideDvsCounter]
    ]) {
      const decision = decide(facts.tables.find((table) => table.name === name));
      result.reasons.push(...decision.reasons);
      if (decision.kind === "reset-required" || decision.kind === "blocked")
        return { kind: decision.kind, repairs: [], reasons: result.reasons };
      if (decision.kind === "repair")
        result.repairs.push({ name, columns, rows: decision.rows });
    }
    for (const table of facts.tables.filter((table) => table.name.startsWith("_dvs_index_"))) {
      const rows = project(table, ["fid", "rid"]);
      if (!rows)
        return {
          kind: "reset-required",
          repairs: [],
          reasons: [...result.reasons, reason("dvs-index-history-lost", table.name)]
        };
      const business = facts.tables.find((candidate) => candidate.name === table.name.slice("_dvs_index_".length));
      const ridColumn = business?.columns.indexOf("rid") ?? -1;
      const normalized = normalizeDvsIndex(rows, {
        state: business && ridColumn >= 0 ? "known" : "unknown",
        rids: business && ridColumn >= 0 ? business.rows.map((row) => row[ridColumn]) : []
      });
      if (!table.matches || !sameRows(rows, normalized.rows)) {
        result.repairs.push({ name: table.name, columns: ["fid", "rid"], rows: normalized.rows });
        result.reasons.push(reason(normalized.removed ? "remove-invalid-dvs-records" : "rebuild-dvs-table", table.name));
      }
    }
    result.kind = result.repairs.length ? "repair" : "none";
    return result;
  }
  function decideScopedRepair(facts, identity, options = {}) {
    if (facts.readFailure)
      return {
        kind: facts.readFailure === "database" ? "reset-required" : "blocked",
        repairs: [],
        reasons: [reason(facts.readFailure === "database" ? "sqlite-unreadable" : "file-unreadable")]
      };
    const wrongObject = facts.objects.find((object) => (object.name === "__stsh_meta" || object.name === "_dvs_version" || object.name === "_dvs_gc_counter" || object.name.startsWith("_dvs_index_")) && object.type !== "table" && object.sql !== null);
    if (wrongObject)
      return { kind: "blocked", repairs: [], reasons: [reason("object-kind", wrongObject.name)] };
    const meta = facts.tables.find((table) => table.name === "__stsh_meta");
    const metadata = !meta && options.requireIdentity === false ? { kind: "none", rows: [], reasons: [] } : decideHelperMetadata(meta, identity);
    if (metadata.kind === "blocked")
      return { kind: "blocked", repairs: [], reasons: metadata.reasons };
    const dvs = decideDvsTables(facts);
    if (dvs.kind === "blocked" || dvs.kind === "reset-required")
      return dvs;
    const repairs = [
      ...metadata.kind === "repair" ? [{ name: "__stsh_meta", columns: ["key", "value"], rows: metadata.rows }] : [],
      ...dvs.repairs
    ];
    for (const repair of repairs) {
      const table = facts.tables.find((table) => table.name === repair.name);
      if (table?.columns.some((column) => !repair.columns.includes(column)))
        return { kind: "blocked", repairs: [], reasons: [reason("extra-columns", repair.name)] };
      const dependency = facts.externalForeignKeys.find((ref) => ref.parent === repair.name);
      if (dependency)
        return { kind: "blocked", repairs: [], reasons: [reason("external-foreign-key", dependency.table)] };
    }
    return { kind: repairs.length ? "repair" : "none", repairs, reasons: [...metadata.reasons, ...dvs.reasons] };
  }

  // src/worker/scoped-database-repair.ts
  var quote4 = (value) => `"${value.replaceAll('"', '""')}"`;
  function definition(name) {
    if (name === "__stsh_meta")
      return { sql: SCOPED_META_TABLE_SQL, columns: ["key", "value"] };
    if (name === "_dvs_version")
      return { sql: DVS_VERSION_TABLE_SQL, columns: ["singleton", "version"] };
    if (name === "_dvs_gc_counter")
      return { sql: DVS_GC_COUNTER_TABLE_SQL, columns: ["singleton", "successful_updates"] };
    if (name.startsWith("_dvs_index_"))
      return { sql: createIndexSql(name.slice("_dvs_index_".length)), columns: ["fid", "rid"] };
  }
  function validateIdentity(identity, options) {
    if (!identity || !["char", "chat"].includes(identity.scope) || !isUuid(identity.charDbId) || (identity.scope === "chat" ? !isUuid(identity.chatDbId) : identity.chatDbId !== undefined) || options.expectedIndexes?.some((name) => typeof name !== "string" || !name.startsWith("_dvs_index_") || name.length < 12 || name.includes("\x00")))
      throw new ServiceError({
        code: "INVALID_REQUEST",
        message: "单库修复需要固定角色／聊天身份和有效的已有索引声明。"
      });
  }
  async function readScopedRepairFacts(db, options = {}) {
    const facts = {
      tables: [],
      objects: [],
      expectedIndexes: [...new Set(options.expectedIndexes ?? [])].sort(),
      externalForeignKeys: [],
      diagnostics: []
    };
    try {
      if (db.availability !== "ready")
        throw new ServiceError({ code: "LOAD_FAILED", message: "数据库尚未正常打开。" });
      await db.assertFileExisting();
      facts.objects = (await db.query({ sql: "SELECT name,type,tbl_name,sql FROM sqlite_master ORDER BY type,name" })).rows.map((row) => ({
        name: String(row[0]),
        type: String(row[1]),
        table: String(row[2]),
        sql: row[3] === null ? null : String(row[3])
      }));
      for (const object of facts.objects.filter((object) => object.type === "table" && !object.name.startsWith("sqlite_"))) {
        try {
          const columns = (await db.query({ sql: "SELECT name FROM pragma_table_xinfo(?) ORDER BY cid", binds: [object.name] })).rows.map((row) => String(row[0]));
          const rows = (await db.query({ sql: `SELECT ${columns.map(quote4).join(",")} FROM ${quote4(object.name)}` })).rows;
          rows.sort((a, b) => scopedValueKey(a).localeCompare(scopedValueKey(b)));
          const expected = definition(object.name);
          facts.tables.push({
            ...object,
            columns,
            rows,
            ...expected ? {
              expectedColumns: expected.columns,
              matches: object.sql !== null && sameDefinition(object.sql, expected.sql)
            } : {}
          });
          const refs = (await db.query({ sql: 'SELECT "table" FROM pragma_foreign_key_list(?)', binds: [object.name] })).rows;
          for (const row of refs)
            if (definition(String(row[0])))
              facts.externalForeignKeys.push({ table: object.name, parent: String(row[0]) });
        } catch (error) {
          facts.readFailure = "read";
          facts.diagnostics.push({ object: object.name, error: errorData(error) });
        }
      }
    } catch (error) {
      facts.readFailure = db.loadFailureStage === "database" ? "database" : "read";
      facts.diagnostics.push({ object: "database", error: errorData(error) });
    }
    return facts;
  }
  async function evidence(facts, identity, options) {
    return sha2562(new TextEncoder().encode(scopedValueKey({ facts, identity, requireIdentity: options.requireIdentity !== false })));
  }
  async function inspect2(db, identity, options) {
    validateIdentity(identity, options);
    const facts = await readScopedRepairFacts(db, options), decision = decideScopedRepair(facts, identity, options);
    const plan = {
      kind: decision.kind,
      evidence: await evidence(facts, identity, options),
      objects: [
        ...new Set([
          ...decision.repairs.map((repair) => repair.name),
          ...decision.reasons.flatMap((reason) => reason.object ? [reason.object] : [])
        ])
      ],
      reasons: decision.reasons,
      identities: helperMetadataIdentities(facts.tables.find((table) => table.name === "__stsh_meta")),
      ...facts.diagnostics.length ? { diagnostics: facts.diagnostics } : {}
    };
    return { facts, decision, plan };
  }
  async function inspectScopedRepair(db, identity, options = {}) {
    return (await inspect2(db, identity, options)).plan;
  }
  function guard2(sql, binds = []) {
    return {
      sql: `INSERT INTO temp.__stsh_scoped_repair_guard(value) SELECT CASE WHEN (${sql}) THEN 1 ELSE 0 END`,
      binds
    };
  }
  function guardRows(name, columns, rows) {
    const groups = new Map;
    for (const row of rows) {
      const key = scopedValueKey(row), old = groups.get(key);
      if (old)
        old.count++;
      else
        groups.set(key, { row, count: 1 });
    }
    return [
      guard2(`SELECT count(*)=? FROM ${quote4(name)}`, [rows.length]),
      ...[...groups.values()].map(({ row, count }) => guard2(`SELECT count(*)=? FROM ${quote4(name)} WHERE ${columns.map((column) => `typeof(${quote4(column)})=typeof(?) AND quote(${quote4(column)})=quote(?) COLLATE BINARY`).join(" AND ")}`, [count, ...row.flatMap((value) => [value, value])]))
    ];
  }
  function createTable(name, asName) {
    const original = definition(name).sql.replace("IF NOT EXISTS ", "");
    const sql = original.replace(`CREATE TABLE ${name === "__stsh_meta" ? name : quote4(name)} `, () => `CREATE TABLE ${quote4(asName)} `);
    return { sql };
  }
  function compileRepairs(facts, repairs) {
    const commands = [
      { sql: "CREATE TEMP TABLE __stsh_scoped_repair_guard(value INTEGER NOT NULL CHECK(value=1))" }
    ];
    commands.push(guard2("SELECT count(*)=? FROM sqlite_master", [facts.objects.length]));
    for (const object of facts.objects)
      commands.push(guard2("SELECT count(*)=1 FROM sqlite_master WHERE name=? AND type=? AND tbl_name=? AND sql IS ?", [
        object.name,
        object.type,
        object.table,
        object.sql
      ]));
    for (const table of facts.tables)
      commands.push(...guardRows(table.name, table.columns, table.rows));
    const copies = repairs.map((repair, index) => ({ ...repair, copy: `__stsh_scoped_copy_${index}` }));
    for (const repair of copies) {
      commands.push(createTable(repair.name, repair.copy));
      for (const row of repair.rows)
        commands.push({
          sql: `INSERT INTO ${quote4(repair.copy)}(${repair.columns.map(quote4).join(",")}) VALUES(${row.map(() => "?").join(",")})`,
          binds: row
        });
      commands.push(...guardRows(repair.copy, repair.columns, repair.rows));
    }
    for (const repair of copies) {
      if (facts.tables.some((table) => table.name === repair.name))
        commands.push({ sql: `DROP TABLE ${quote4(repair.name)}` });
      commands.push(createTable(repair.name, repair.name), {
        sql: `INSERT INTO ${quote4(repair.name)}(${repair.columns.map(quote4).join(",")}) SELECT ${repair.columns.map(quote4).join(",")} FROM ${quote4(repair.copy)}`
      });
      const extensions = facts.objects.filter((object) => object.table === repair.name && object.sql && ["index", "trigger"].includes(object.type));
      for (const object of extensions)
        commands.push({ sql: object.sql });
      commands.push(...guardRows(repair.name, repair.columns, repair.rows));
    }
    for (const table of facts.tables.filter((table) => !repairs.some((repair) => repair.name === table.name)))
      commands.push(...guardRows(table.name, table.columns, table.rows));
    for (const repair of copies)
      commands.push({ sql: `DROP TABLE ${quote4(repair.copy)}` });
    commands.push({ sql: "DROP TABLE temp.__stsh_scoped_repair_guard" });
    return commands;
  }
  function verifyRetainedTables(before, after, repairs) {
    const expectedTables = [
      ...before.tables.filter((table) => !repairs.some((repair) => repair.name === table.name)),
      ...repairs
    ];
    for (const table of expectedTables) {
      const { rows: expectedRows, columns: expectedColumns } = table;
      const actual = after.tables.find((actual) => actual.name === table.name);
      if (!actual || scopedValueKey(actual.columns) !== scopedValueKey(expectedColumns) || scopedValueKey(actual.rows.map(scopedValueKey).sort()) !== scopedValueKey(expectedRows.map(scopedValueKey).sort()))
        throw new ServiceError({
          code: "RESULT_UNCONFIRMED",
          resultState: "unconfirmed",
          message: "数据库已保存，但保留内容读回不一致。请重新扫描。"
        });
    }
    for (const object of before.objects.filter((object) => object.sql !== null && !repairs.some((repair) => repair.name === object.name))) {
      const actual = after.objects.find((actual) => actual.name === object.name && actual.type === object.type);
      if (!actual || actual.sql !== object.sql)
        throw new ServiceError({
          code: "RESULT_UNCONFIRMED",
          resultState: "unconfirmed",
          message: "数据库已保存，但用户索引、触发器或视图未能读回确认。请重新扫描。"
        });
    }
  }
  async function applyScopedRepair(db, request, options = {}) {
    const current = await inspect2(db, request.identity, options);
    if (current.plan.evidence !== request.expected?.evidence)
      return { status: "skipped", plan: current.plan };
    if (current.plan.kind === "none")
      return { status: "unchanged", plan: current.plan };
    if (current.plan.kind !== "repair")
      return { status: current.plan.kind, plan: current.plan };
    await db.transaction(compileRepairs(current.facts, current.decision.repairs), undefined, { management: true });
    await db.refresh();
    const saved = await inspect2(db, request.identity, options);
    if (saved.plan.kind !== "none") {
      const original = saved.plan.diagnostics?.[0]?.error;
      throw new ServiceError({
        ...original,
        code: "RESULT_UNCONFIRMED",
        resultState: "unconfirmed",
        message: "数据库已保存，但修复读回未通过。请重新扫描。",
        ...original ? { causeError: original.causeError ?? { name: "ReadbackError", message: original.message } } : {}
      });
    }
    verifyRetainedTables(current.facts, saved.facts, current.decision.repairs);
    return { status: "repaired", plan: saved.plan };
  }

  // src/worker/database-maintenance.ts
  async function maintenanceDigest(value) {
    const bytes = value instanceof Uint8Array ? value : new TextEncoder().encode(managementValueKey(value));
    return sha2562(bytes);
  }
  async function snapshot(context) {
    if (context.root?.availability === "ready")
      return scanRecords(context.root, storageName(context.directory));
    const db = await context.create({ scope: "global" });
    try {
      await db.openExisting();
      return await scanRecords(db, storageName(context.directory));
    } finally {
      await db.close();
    }
  }
  async function inspectDatabaseMaintenance(context, target, evidence) {
    const db = await context.create(target);
    try {
      if (target.scope !== "global") {
        const records = await snapshot(context);
        const database = await scanDatabase(db, context.directory, target.charDbId, target.scope === "chat" ? target.chatDbId : undefined);
        const registration = records.targets.find((t) => t.scope === target.scope && t.charDbId === target.charDbId && (t.chatDbId ?? "") === (target.scope === "chat" ? target.chatDbId : ""));
        const requireIdentity = registration?.origin === "generated" || records.records.some((r) => r.origin === "generated" && r.id === (target.scope === "chat" ? target.chatDbId : target.charDbId) && (r.scope === "char" || r.parent === target.charDbId));
        const repair = database.status === "checked" ? await inspectScopedRepair(db, target, { requireIdentity }) : undefined;
        const decision = decideDatabaseMaintenance(target, records, database, repair, evidence.observations);
        if (database.reason)
          decision.diagnostics = [
            ...decision.diagnostics ?? [],
            { object: decision.relativePath, error: { code: "LOAD_FAILED", message: database.reason } }
          ];
        return {
          plan: {
            ...decision,
            evidence: await maintenanceDigest({ records, database, repair, target, observations: evidence.observations })
          }
        };
      }
      let bytes;
      try {
        bytes = (await createStorage(context.directory).readSnapshot()).bytes;
      } catch (error) {
        return {
          plan: {
            kind: "blocked",
            evidence: "",
            target,
            relativePath: GLOBAL_DATABASE,
            records: [],
            reasons: [{ code: "file-unreadable" }],
            loss: [],
            file: "unknown",
            diagnostics: [{ object: GLOBAL_DATABASE, error: errorData(error) }]
          }
        };
      }
      let facts;
      let damaged = bytes === null;
      try {
        if (bytes !== null) {
          await db.openExisting();
          facts = await readManagementRepairFacts(db);
        }
      } catch (error) {
        if (db.loadFailureStage !== "database")
          throw error;
        damaged = true;
      }
      const hasManagement = facts?.objects.some((object) => object.type && object.name.startsWith("__stsh_"));
      if (!damaged && (hasManagement || !evidence.discovery?.matches.length)) {
        const management = await inspectManagementRepair(db, {
          ...context.managementOptions,
          observations: evidence.observations
        });
        if (management.kind !== "blocked")
          return {
            plan: {
              kind: "none",
              evidence: management.evidence,
              target,
              relativePath: GLOBAL_DATABASE,
              records: [],
              reasons: [],
              loss: [],
              file: "present"
            }
          };
      }
      const initial = reconstructGlobalRecords(facts, evidence.discovery);
      const targets = reconstructionRecords(initial).flatMap((r) => r.id ? [
        {
          scope: r.scope,
          charDbId: r.scope === "char" ? r.id : r.parent,
          ...r.scope === "chat" ? { chatDbId: r.id } : {},
          origin: r.origin
        }
      ] : []);
      const supplemental = [];
      for (const t of targets) {
        if (supplemental.some((old) => databasePath(old.target.charDbId, old.target.chatDbId) === databasePath(t.charDbId, t.chatDbId)))
          continue;
        const scoped = await context.create(t.scope === "chat" ? { scope: "chat", charDbId: t.charDbId, chatDbId: t.chatDbId } : { scope: "char", charDbId: t.charDbId });
        try {
          const read = await scanDatabase(scoped, context.directory, t.charDbId, t.chatDbId);
          supplemental.push({
            target: t,
            state: read.status === "checked" ? "ready" : read.status === "missing" ? "missing" : "unknown"
          });
        } finally {
          await scoped.close();
        }
      }
      const completeFacts = facts ?? {
        objects: [],
        tables: {},
        unreadable: [],
        externalForeignKeys: [],
        sequences: {},
        targetFiles: [],
        recordChecks: []
      };
      completeFacts.targetFiles = supplemental;
      const decision = reconstructGlobalRecords(completeFacts, evidence.discovery);
      const kind = decision.blocked.length ? "blocked" : damaged ? "reset" : "reconstruct";
      const extraColumns = Object.entries(facts?.tables ?? {}).flatMap(([name, table]) => table.columns.filter((column) => !MANAGEMENT_COLUMNS[name].includes(column)).map((column) => `${name}.${column}`));
      const loss = damaged ? ["全局库中的业务数据和插件设置无法恢复，将重新开始；角色库、聊天库与酒馆消息保留。"] : [
        `保留可读的全局业务数据、设置和能够确认的关联；无法恢复的登记${decision.lost ? `或设置条目（${decision.lost} 条）` : "内容"}将舍弃。无法关联的旧文件仍保留。`,
        ...!facts?.tables.__stsh_meta ? ["原插件设置表已缺失，设置无法恢复，需要重新配置。"] : [],
        ...extraColumns.length ? [
          `插件登记中有 ${extraColumns.length} 个无法兼容的附加字段，其内容会从新登记中移除；完整原内容保存在备份中。`
        ] : []
      ];
      const plan = {
        kind,
        evidence: await maintenanceDigest({
          bytes: bytes === null ? null : await maintenanceDigest(bytes),
          facts: completeFacts,
          discovery: evidence.discovery
        }),
        target,
        relativePath: GLOBAL_DATABASE,
        records: reconstructionRecords(decision),
        reasons: [
          ...decision.blocked.map((code) => ({ code })),
          ...extraColumns.map((object) => ({ code: "discard-extra-field", object }))
        ],
        loss,
        file: bytes === null ? "missing" : "present",
        ...facts?.diagnostics?.length ? { diagnostics: facts.diagnostics } : {}
      };
      return { plan, facts: completeFacts };
    } finally {
      await db.close();
    }
  }
  async function maintenanceBackup(directory, plan) {
    if (plan.file === "missing")
      return {};
    const file = await readScanFile(directory, plan.relativePath);
    return { file, digest: await maintenanceDigest(file.bytes) };
  }

  // src/worker/identity-restart.ts
  var hash = (value) => sha2562(new TextEncoder().encode(JSON.stringify(value)));
  async function inspect3(root, request, hooks, allocate = true) {
    hooks.assertAvailable();
    const snapshot = await scanRecords(root, "");
    const roles = snapshot.records.filter((record) => record.scope === "char" && record.avatar === request.avatar && record.state === "active");
    const allChats = snapshot.records.filter((record) => record.scope === "chat" && record.avatar === request.avatar && record.state !== "deleted");
    const chats = request.scope === "chat" ? allChats.filter((record) => record.file === request.file) : allChats;
    const role = roles[0] ?? null;
    const preservedFiles = new Set;
    const databaseFacts = [];
    const plan = {
      kind: "blocked",
      scope: request.scope,
      avatar: request.avatar,
      ...request.file ? { file: request.file } : {},
      evidence: "",
      expectedRole: role,
      expectedChats: chats,
      chats: [],
      preservedFiles: [],
      reasons: [],
      loss: [],
      observations: request.observations,
      discovery: request.discovery,
      chatFiles: request.chatFiles
    };
    const block = (code) => {
      plan.reasons.push({ code });
    };
    if (snapshot.management !== "valid" || roles.length > 1 || !request.avatar || request.scope === "chat" && !request.file)
      block("management-unavailable");
    if (role?.taskReasons.length || chats.some((record) => record.taskReasons.length))
      block("active-task");
    const files = new Set(chats.flatMap((record) => record.file ? [record.file] : []));
    if (request.scope === "role") {
      if (!request.chatFiles || request.chatFiles.some((file) => typeof file !== "string" || !file || file.includes("\x00")))
        block("chat-list-unavailable");
      else
        for (const file of request.chatFiles)
          files.add(file);
    }
    if (request.scope === "chat" && request.file)
      files.add(request.file);
    if (request.scope === "role") {
      for (const match of request.discovery?.matches ?? [])
        if (match.avatar === request.avatar)
          files.add(match.file);
    }
    if (request.scope === "chat" && (!role?.id || !isUuid(role.id)))
      block("parent-unresolved");
    if (request.scope === "role" && role?.id && isUuid(role.id))
      block("role-identity-known");
    if (request.scope === "role" && request.discovery?.complete !== true)
      block("discovery-incomplete");
    if (request.scope === "role" && !request.observations?.some((observation) => observation.scope === "char" && observation.avatar === request.avatar && observation.status === "same") && !request.discovery?.matches.some((match) => match.avatar === request.avatar && match.rolePresent === true))
      block("owner-readback-required");
    let recoverable = false;
    for (const file of files) {
      const matching = chats.filter((record) => record.file === file);
      const observed = request.observations?.find((observation) => observation.scope === "chat" && (!matching.length || observation.referenceId === matching[0].referenceId) && observation.avatar === request.avatar && observation.file === file);
      const found = request.discovery?.matches.filter((match) => match.avatar === request.avatar && match.file === file) ?? [];
      if (observed?.status !== "same" && !found.length)
        block("owner-readback-required");
      const candidates = new Set;
      for (const record of matching)
        if (record.parent && record.id && isUuid(record.parent) && isUuid(record.id))
          candidates.add(JSON.stringify([record.parent, record.id]));
      if (role?.id && isUuid(role.id) && observed?.observedId && isUuid(observed.observedId))
        candidates.add(JSON.stringify([role.id, observed.observedId]));
      for (const match of found)
        candidates.add(JSON.stringify([match.parent, match.chatId]));
      let usable = 0;
      for (const candidate of candidates) {
        const [parent, id] = JSON.parse(candidate);
        const database = await hooks.readDatabase(parent, id);
        databaseFacts.push(database);
        preservedFiles.add(databasePath(parent, id));
        const origin = snapshot.targets.find((target) => target.scope === "chat" && target.charDbId === parent && target.chatDbId === id)?.origin;
        if (repairDatabaseUsable(database, origin))
          usable++;
        else if (database.status === "unknown" && database.failure !== "database")
          block("file-unreadable");
      }
      if (usable === 1)
        recoverable = true;
      if (matching.length === 1 && matching[0].confirmed && matching[0].id && databaseFacts.some((database) => database.charDbId === matching[0].parent && database.chatDbId === matching[0].id && repairDatabaseUsable(database, snapshot.targets.find((target) => target.charDbId === database.charDbId && target.chatDbId === database.chatDbId)?.origin)))
        recoverable = true;
    }
    if (recoverable)
      block("recoverable-association-first");
    if (request.scope === "chat" && chats.length > 1)
      block("conflicting-records");
    if (!plan.reasons.length) {
      plan.kind = "restart";
      plan.newCharDbId = request.scope === "chat" ? role.id : allocate ? randomUuid() : undefined;
      plan.chats = [...files].sort().map((file) => ({ file, chatDbId: allocate ? randomUuid() : "" }));
      plan.loss = [
        request.scope === "chat" ? "此聊天将开始使用新的插件数据，原有数据不会恢复对应关系；旧数据库文件保留。" : "这个角色及列出的聊天将开始使用新的插件数据，原有对应关系不再使用；旧数据库文件保留。"
      ];
    }
    plan.preservedFiles = [...preservedFiles].sort();
    plan.evidence = await hash({
      scope: request.scope,
      avatar: request.avatar,
      file: request.file,
      records: snapshot.records.filter((record) => record.avatar === request.avatar),
      targets: snapshot.targets,
      observations: request.observations,
      discovery: request.discovery,
      chatFiles: request.chatFiles ? [...new Set(request.chatFiles)].sort() : undefined,
      databaseFacts
    });
    hooks.assertAvailable();
    return plan;
  }
  async function restartIdentity(root, request, hooks) {
    if (request.phase === "inspect")
      return { status: "planned", plan: await inspect3(root, request, hooks) };
    const expected = request.expected;
    if (expected.scope === "role" && (!request.chatFiles || JSON.stringify([...new Set(request.chatFiles)].sort()) !== JSON.stringify([...expected.chatFiles ?? []].sort())))
      return {
        status: "skipped",
        plan: expected,
        requiresRescan: true,
        message: "角色的聊天列表已变化或未能读取，请重新扫描。"
      };
    if (request.phase === "apply" && expected.chats.some((chat) => !request.observations?.some((observation) => observation.scope === "chat" && observation.avatar === expected.avatar && observation.file === chat.file && observation.status === "same" && observation.observedId === chat.chatDbId)))
      return {
        status: "skipped",
        plan: expected,
        requiresRescan: true,
        message: "新的聊天编号尚未重新读回，请重新扫描。"
      };
    const current = await inspect3(root, {
      phase: "inspect",
      scope: expected.scope,
      avatar: expected.avatar,
      ...expected.file ? { file: expected.file } : {},
      observations: request.phase === "apply" ? expected.observations : request.observations,
      discovery: request.phase === "apply" ? expected.discovery : request.discovery,
      chatFiles: request.chatFiles
    }, hooks, false);
    const skipped = (message) => ({
      status: "skipped",
      plan: expected,
      requiresRescan: true,
      message
    });
    if (current.kind !== "restart" || current.evidence !== expected.evidence)
      return skipped("聊天或登记已变化，未重新开始。请重新扫描。");
    if ([current.expectedRole, ...current.expectedChats].some((record) => record && !Number.isSafeInteger((record.generation ?? 0) + 1)))
      return skipped("关联编号已超出支持范围，未重新开始。");
    if (!expected.newCharDbId || !isUuid(expected.newCharDbId) || expected.chats.length !== current.chats.length || expected.chats.some((chat, index) => !isUuid(chat.chatDbId) || chat.file !== current.chats[index].file) || new Set(expected.chats.map((chat) => chat.chatDbId)).size !== expected.chats.length)
      throw new ServiceError({ code: "INVALID_REQUEST", message: "新的身份清单无效。" });
    if (expected.scope === "chat" && expected.newCharDbId !== current.newCharDbId)
      return skipped("父角色已变化，请重新扫描。");
    if (expected.scope === "role" && await hooks.pathExists(expected.newCharDbId))
      return skipped("新角色路径已有文件，请重新扫描。");
    for (const chat of expected.chats)
      if (await hooks.pathExists(expected.newCharDbId, chat.chatDbId))
        return skipped("新聊天路径已有文件，请重新扫描。");
    hooks.assertAvailable();
    if (request.phase === "check")
      return { status: "checked", plan: expected };
    if (request.confirmedChats.length !== expected.chats.length || expected.chats.some((chat) => !request.confirmedChats.some((confirmed) => confirmed.file === chat.file && confirmed.chatDbId === chat.chatDbId)))
      throw new ServiceError({ code: "INVALID_REQUEST", message: "所有受影响聊天的新编号尚未读回确认。" });
    const commands = [];
    const role = current.expectedRole;
    commands.push(rawGuard(role ? `SELECT 1 FROM ${ROLES} WHERE role_id=? AND avatar_name=? AND char_dbid IS ? AND generation=?` : `SELECT 1 WHERE NOT EXISTS(SELECT 1 FROM ${ROLES} WHERE avatar_name=? AND state='active')`, role ? [role.referenceId, role.avatar, role.id, role.generation] : [expected.avatar]));
    if (expected.scope === "role") {
      if (role)
        commands.push({
          sql: `UPDATE ${ROLES} SET char_dbid=?,generation=?,confirmed=1,origin='generated' WHERE role_id=?`,
          binds: [expected.newCharDbId, role.generation + 1, role.referenceId]
        });
      else
        commands.push({
          sql: `INSERT INTO ${ROLES}(avatar_name,char_dbid,generation,confirmed,origin,state) VALUES(?,?,1,1,'generated','active')`,
          binds: [expected.avatar, expected.newCharDbId]
        });
      commands.push({
        sql: `INSERT INTO ${TARGETS} VALUES('char',?,'','generated','never')`,
        binds: [expected.newCharDbId]
      });
    }
    for (const chat of expected.chats) {
      const previous = current.expectedChats.find((record) => record.file === chat.file);
      if (previous) {
        commands.push(rawGuard(`SELECT 1 FROM ${CHATS} WHERE chat_id=? AND file_name=? AND chat_dbid IS ? AND generation=?`, [
          previous.referenceId,
          previous.file,
          previous.id,
          previous.generation
        ]));
        commands.push({
          sql: `UPDATE ${CHATS} SET chat_dbid=?,parent_char_dbid=?,generation=?,confirmed=1,origin='generated' WHERE chat_id=?`,
          binds: [chat.chatDbId, expected.newCharDbId, previous.generation + 1, previous.referenceId]
        });
      } else
        commands.push({
          sql: `INSERT INTO ${CHATS}(role_id,file_name,chat_dbid,parent_char_dbid,generation,confirmed,origin,state) SELECT role_id,?,?,?,1,1,'generated','active' FROM ${ROLES} WHERE avatar_name=? AND state='active'`,
          binds: [chat.file, chat.chatDbId, expected.newCharDbId, expected.avatar]
        });
      commands.push({
        sql: `INSERT INTO ${TARGETS} VALUES('chat',?,?,'generated','never')`,
        binds: [expected.newCharDbId, chat.chatDbId]
      });
    }
    await root.transaction(commands, undefined, {
      management: true,
      beforeExecute: () => {
        hooks.assertAvailable();
        if (expected.scope === "role" && role)
          hooks.invalidate(role);
        for (const record of current.expectedChats)
          hooks.invalidate(record);
      }
    });
    await root.refresh();
    const saved = await scanRecords(root, "");
    if (saved.management !== "valid" || expected.scope === "role" && !saved.records.some((record) => record.scope === "char" && record.avatar === expected.avatar && record.id === expected.newCharDbId && record.confirmed && record.generation === (role?.generation ?? 0) + 1) || !expected.chats.every((chat) => saved.records.some((record) => record.scope === "chat" && record.avatar === expected.avatar && record.file === chat.file && record.id === chat.chatDbId && record.parent === expected.newCharDbId && record.generation === (current.expectedChats.find((previous) => previous.file === chat.file)?.generation ?? 0) + 1 && record.confirmed && record.origin === "generated" && record.initialization === "never")))
      throw new ServiceError({
        code: "RESULT_UNCONFIRMED",
        resultState: "unconfirmed",
        message: "新登记已提交，但未能读回确认。请重新扫描。"
      });
    return {
      status: "restarted",
      plan: expected,
      requiresRescan: true,
      message: "已切换到新的插件数据，旧文件保留。请刷新并重新取得目标。"
    };
  }

  // src/worker/storage-coordinator.ts
  function validateScopedTarget(binding) {
    if (!["char", "chat"].includes(binding.scope ?? ""))
      throw new ServiceError({
        code: "INVALID_REQUEST",
        failureKind: "request-rejected",
        message: "身份记录需要 char 或 chat 目标。"
      });
    if (!isUuid(binding.charDbId))
      throw new ServiceError({
        code: "INVALID_REQUEST",
        failureKind: "request-rejected",
        message: "角色目标需要有效 UUID。"
      });
    if (binding.scope === "chat" ? !isUuid(binding.chatDbId) : binding.chatDbId !== undefined)
      throw new ServiceError({
        code: "INVALID_REQUEST",
        failureKind: "request-rejected",
        message: "聊天目标需要有效 UUID，char 目标不接受聊天身份。"
      });
  }
  function validateGlobalTarget(binding) {
    if (binding.charDbId !== undefined || binding.chatDbId !== undefined)
      throw new ServiceError({
        code: "INVALID_REQUEST",
        failureKind: "request-rejected",
        message: "global 目标不接受角色或聊天身份。"
      });
  }

  class StorageCoordinator {
    repository;
    createDatabase;
    changed;
    getOpfsDirectory;
    tail = Promise.resolve();
    configuration;
    registry;
    mode = "directory";
    autoReloadEnabled = true;
    reloadTimer;
    reloadPending = false;
    registryLoaded = false;
    database;
    scopedDatabases = new Map;
    cleanupSeals = new Set;
    targets;
    beforeScopedExecution;
    beforeConfigurationChange;
    beforeManagementRepair;
    cleanupWaiting;
    beforeScanRepair;
    invalidateScanReference;
    scanRepairCompleted;
    onBackgroundSaveFailed;
    permission;
    switching = false;
    revision = 0;
    lastError;
    publishedUnsaved = false;
    restored;
    constructor(repository, createDatabase, changed = () => {}, getOpfsDirectory = opfsDirectory) {
      this.repository = repository;
      this.createDatabase = createDatabase;
      this.changed = changed;
      this.getOpfsDirectory = getOpfsDirectory;
      this.restored = this.enqueue(async () => {
        try {
          await this.readRegistry();
        } catch (error) {
          this.lastError = errorData(error);
        }
        this.publish();
      });
    }
    source() {
      const configuration = this.configuration;
      return configuration.mode === "indexeddb" ? configuration : configuration.directory;
    }
    enqueue(task) {
      const result = this.tail.then(task);
      this.tail = result.catch(() => {
        return;
      });
      return result;
    }
    info() {
      const state = !this.configuration ? this.lastError ? "unavailable" : "uninitialized" : this.permission !== "granted" ? "permission-required" : this.database?.availability === "ready" ? "ready" : "unavailable";
      return {
        storage: {
          revision: this.revision,
          state,
          initialized: state === "ready",
          switching: this.switching,
          mode: this.mode,
          autoReloadEnabled: this.autoReloadEnabled,
          storageId: this.configuration?.storageId,
          configGeneration: this.configuration?.configGeneration ?? 0,
          permission: this.permission,
          error: this.lastError,
          unsavedChanges: this.unsavedChanges()
        },
        directory: this.mode === "directory" ? this.configuration?.directory : undefined
      };
    }
    unsavedChanges() {
      if (this.database?.unsavedChanges)
        return true;
      for (const entry of this.scopedDatabases.values())
        if (entry.db.unsavedChanges)
          return true;
      return false;
    }
    publish() {
      this.revision++;
      const info = this.info();
      this.publishedUnsaved = info.storage.unsavedChanges === true;
      try {
        this.changed(info);
      } catch {}
    }
    unsavedChanged = () => {
      if (this.unsavedChanges() !== this.publishedUnsaved)
        this.publish();
    };
    async readRegistry() {
      if (this.registryLoaded)
        return;
      const stored = await this.repository.read();
      if (stored) {
        validateConfiguration(stored);
        const active = stored.spaces.find((s) => s.storageId === stored.storageId);
        if ((stored.mode ?? "directory") !== (active.mode ?? "directory") || stored.mode !== "indexeddb" && (active.mode === "indexeddb" || !await stored.directory.isSameEntry(active.directory)) || stored.savedDirectory && !await stored.savedDirectory.directory.isSameEntry(stored.spaces.find((s) => s.storageId === stored.savedDirectory.storageId).directory))
          throw new ServiceError({ code: "CONFIG_FAILED", message: "目录配置身份与句柄不一致。" });
        this.configuration = stored;
        this.registry = stored;
        this.mode = stored.mode ?? "directory";
        this.autoReloadEnabled = stored.autoReloadEnabled ?? true;
      }
      this.registryLoaded = true;
    }
    async checkPermission() {
      if (!this.configuration)
        return false;
      if (this.configuration.mode === "opfs" || this.configuration.mode === "indexeddb") {
        this.permission = "granted";
        return true;
      }
      this.permission = await directoryPermission(this.configuration.directory);
      return this.permission === "granted";
    }
    async requirePermission() {
      if (!await this.checkPermission())
        throw new ServiceError({
          code: "PERMISSION_REQUIRED",
          message: "已保存目录需要重新授权，请点击重新授权已配置目录。"
        });
    }
    async loadDatabase() {
      if (this.database) {
        await this.database.refresh();
        await this.rootLoaded(this.database, this.targets);
        return;
      }
      const candidate = await this.createDatabase(this.source(), undefined, this.mode);
      try {
        await candidate.openExisting();
        this.bindDatabase(candidate, this.configuration);
        this.database = candidate;
        this.targets = new RootTargets(candidate);
        await this.rootLoaded(candidate, this.targets);
      } catch (error) {
        await candidate.close();
        throw error;
      }
    }
    bindDatabase(db, binding) {
      const fixed = {
        storageId: binding.storageId,
        configGeneration: binding.configGeneration,
        scope: binding.scope ?? "global",
        ...binding.charDbId ? { charDbId: binding.charDbId } : {},
        ...binding.chatDbId ? { chatDbId: binding.chatDbId } : {}
      };
      db.onUnsavedChanged = this.unsavedChanged;
      db.onBackgroundSaveFailed = (failure) => {
        this.lastError = failure.error;
        this.publish();
        this.onBackgroundSaveFailed?.(fixed, failure);
      };
    }
    async closeDatabases() {
      const databases = [...this.scopedDatabases.values()].map((entry) => entry.db);
      if (this.database)
        databases.push(this.database);
      for (const db of databases)
        db.sealBackgroundSaves();
      await Promise.allSettled([...this.scopedDatabases.values()].map((entry) => entry.tail));
      await Promise.all(databases.map((db) => db.drain()));
      for (const db of databases)
        await db.close();
    }
    async rootLoaded(db, targets = new RootTargets(db)) {
      try {
        await targets.validateExisting();
        targets.invalidate();
      } catch (error) {
        await db.close();
        throw error;
      }
    }
    checkBinding(binding) {
      if (!this.configuration) {
        if (this.lastError?.code === "CONFIG_FAILED")
          throw new ServiceError(this.lastError);
        if (this.mode === "opfs" && this.lastError)
          throw new ServiceError(this.lastError);
        throw new ServiceError({
          code: "NOT_INITIALIZED",
          message: "制卡模式尚未配置数据库目录；请在插件设置的「制卡高级设置」中选择并授权存储目录。"
        });
      }
      if (!binding || typeof binding.storageId !== "string" || !Number.isSafeInteger(binding.configGeneration)) {
        throw new ServiceError({
          code: "INVALID_REQUEST",
          failureKind: "request-rejected",
          message: "数据库请求必须携带捕获的存储身份和配置代次。"
        });
      }
      if (binding.storageId !== this.configuration.storageId || binding.configGeneration !== this.configuration.configGeneration) {
        throw new ServiceError({
          code: "STALE_CONFIGURATION",
          message: "原目录配置已失效，请取得新目标；旧请求不会改写新目录。"
        });
      }
    }
    admit() {
      if (this.switching)
        throw new ServiceError({ code: "CONFIG_CHANGING", message: "存储正在处理中，请等待完成后再试。" });
    }
    queueChecked(binding, task) {
      const captured = { ...binding };
      return this.enqueue(async () => {
        this.checkBinding(captured);
        await this.requirePermission();
        return task(captured);
      });
    }
    admitted(binding, task) {
      try {
        this.admit();
      } catch (error) {
        return Promise.reject(error);
      }
      return this.queueChecked(binding, task);
    }
    getStatus() {
      return this.enqueue(async () => {
        if (this.configuration) {
          try {
            await this.checkPermission();
          } catch (error) {
            this.permission = "prompt";
            this.lastError = errorData(error);
          }
        }
        this.publish();
        return this.info();
      });
    }
    select(directory) {
      if (this.mode !== "directory")
        return Promise.reject(new ServiceError({ code: "STALE_CONFIGURATION", message: "当前使用游玩模式，原目录选择结果已失效。" }));
      return this.switchDirectory(directory, "directory");
    }
    configureMode(mode, autoReloadEnabled) {
      if (!["opfs", "directory", "indexeddb"].includes(mode) || typeof autoReloadEnabled !== "boolean")
        return Promise.reject(new ServiceError({ code: "INVALID_REQUEST", message: "存储模式设置无效。" }));
      if (this.switching)
        return Promise.reject(new ServiceError({ code: "CONFIG_CHANGING", message: "已有存储切换尚未完成。" }));
      return this.switchDirectory(undefined, mode, autoReloadEnabled);
    }
    switchDirectory(selected, mode, autoReloadEnabled = this.autoReloadEnabled) {
      if (this.switching)
        return Promise.reject(new ServiceError({ code: "CONFIG_CHANGING", message: "已有目录切换尚未完成。" }));
      this.switching = true;
      this.publish();
      return this.enqueue(async () => {
        let candidate;
        try {
          await this.readRegistry();
          const old = this.registry;
          const savedDirectory = old?.savedDirectory ?? (old && old.mode !== "indexeddb" && (old.mode ?? "directory") === "directory" ? { storageId: old.storageId, directory: old.directory, mode: "directory" } : undefined);
          const directory = selected ?? (mode === "opfs" ? await this.getOpfsDirectory() : savedDirectory?.directory);
          if (!directory && mode !== "indexeddb") {
            this.beforeConfigurationChange?.();
            await this.closeDatabases();
            this.database = undefined;
            this.targets = undefined;
            this.scopedDatabases.clear();
            this.configuration = undefined;
            this.mode = mode;
            this.autoReloadEnabled = autoReloadEnabled;
            this.permission = undefined;
            this.lastError = undefined;
            this.updateReloadTimer();
            return this.info();
          }
          if (this.configuration && (mode !== this.mode || mode !== "indexeddb" && !await directory.isSameEntry(this.configuration.directory)))
            this.beforeConfigurationChange?.();
          await Promise.allSettled([...this.scopedDatabases.values()].map((entry) => entry.tail));
          const permission = mode !== "directory" ? "granted" : await directoryPermission(directory);
          if (selected && permission !== "granted")
            throw new ServiceError({ code: "PERMISSION_REQUIRED", message: "新目录未获得读写授权，原配置保持不变。" });
          let storageId;
          for (const space of old?.spaces ?? []) {
            if ((space.mode ?? "directory") === mode && (mode === "indexeddb" || space.mode !== "indexeddb" && await directory.isSameEntry(space.directory))) {
              storageId = space.storageId;
              break;
            }
          }
          storageId ??= randomUuid();
          const same = storageId === this.configuration?.storageId && mode === this.mode;
          const configGeneration = same ? old.configGeneration : (old?.configGeneration ?? 0) + 1;
          if (!Number.isSafeInteger(configGeneration))
            throw new ServiceError({ code: "CONFIG_FAILED", message: "配置代次已超过安全整数范围。" });
          const known = old?.spaces.some((space) => space.storageId === storageId) ?? false;
          if (permission === "granted") {
            candidate = same && this.database ? this.database : await this.createDatabase(mode === "indexeddb" ? { storageId, mode: "indexeddb" } : directory, undefined, mode);
            if (!(same && candidate.availability === "ready")) {
              if (known)
                await candidate.openExisting();
              else
                await candidate.open();
            }
            await this.rootLoaded(candidate, same ? this.targets : undefined);
          }
          if (old && !same)
            this.beforeConfigurationChange?.();
          const space = mode === "indexeddb" ? { storageId, mode: "indexeddb" } : { storageId, directory, mode };
          const spaces = [...(old?.spaces ?? []).filter((s) => s.storageId !== storageId), space];
          const next = {
            ...space,
            configGeneration,
            spaces,
            savedDirectory: space.mode === "directory" ? space : savedDirectory,
            autoReloadEnabled
          };
          if (selected || !same || autoReloadEnabled !== (old?.autoReloadEnabled ?? true))
            await this.repository.write(next);
          if (this.database !== candidate && (!same || !candidate))
            await this.closeDatabases();
          if (!same || !candidate) {
            this.scopedDatabases.clear();
          }
          this.configuration = next;
          if (this.database !== candidate)
            this.targets = candidate ? new RootTargets(candidate) : undefined;
          this.database = candidate;
          if (candidate)
            this.bindDatabase(candidate, next);
          this.registry = next;
          this.mode = mode;
          this.autoReloadEnabled = autoReloadEnabled;
          this.updateReloadTimer();
          this.permission = permission;
          this.lastError = undefined;
          this.switching = false;
          return this.info();
        } catch (error) {
          if (candidate && candidate !== this.database)
            await candidate.close();
          this.lastError = errorData(error);
          throw error;
        } finally {
          this.switching = false;
          this.publish();
        }
      });
    }
    validateIdentityBinding(binding) {
      return this.admitted(binding, async () => {});
    }
    manageEntities(binding, task, readOnly = false) {
      return this.admitted(binding, async (captured) => {
        if (!this.database || !this.targets)
          throw new ServiceError({ code: "INSTANCE_DISABLED", message: "root 文件尚未恢复。" });
        return task(new RootEntities(this.database, readOnly ? new RootTargets(this.database, true) : this.targets, (target) => this.cleanupWaiting?.(captured, target) ?? false));
      });
    }
    scan(binding, request) {
      try {
        this.admit();
      } catch (error) {
        return Promise.reject(error);
      }
      const instruction = structuredClone(request);
      return this.queueChecked(binding, async (captured) => {
        const directory = this.source();
        if (instruction.operation === "maintenance") {
          this.validateMaintenanceTarget(instruction.target);
          return (await inspectDatabaseMaintenance(this.maintenanceContext(captured), instruction.target, instruction)).plan;
        }
        if (instruction.operation === "management")
          return this.withMaintenanceRoot((root) => inspectManagementRepair(root, this.managementRepairOptions(captured, instruction.observations)));
        if (instruction.operation === "records") {
          if (this.database?.availability !== "ready") {
            try {
              return await this.withMaintenanceRoot((root) => scanRecords(root, storageName(directory)));
            } catch (error) {
              return {
                directoryName: storageName(directory),
                management: "unreadable",
                differences: [],
                rootReadable: false,
                records: [],
                targets: [],
                issues: [{ relativePath: GLOBAL_DATABASE, reason: errorData(error).message }]
              };
            }
          }
          return scanRecords(this.database, storageName(directory));
        }
        if (instruction.operation === "inventory")
          return scanInventory(directory);
        if (instruction.operation === "read")
          return readScanFile(directory, instruction.relativePath);
        if (instruction.operation === "file")
          return scanFile(directory, instruction.charDbId, instruction.chatDbId);
        if (instruction.operation === "database") {
          const { charDbId, chatDbId } = instruction;
          const db = await this.createDatabase(directory, {
            ...captured,
            scope: chatDbId ? "chat" : "char",
            charDbId,
            ...chatDbId ? { chatDbId } : {}
          }, this.mode);
          try {
            return await scanDatabase(db, directory, charDbId, chatDbId);
          } finally {
            await db.close();
          }
        }
        throw new ServiceError({ code: "INVALID_REQUEST", message: "扫描请求类型无效。" });
      });
    }
    async withMaintenanceRoot(task) {
      if (this.database?.availability === "ready")
        return task(this.database);
      const root = await this.createDatabase(this.source(), undefined, this.mode);
      try {
        await root.openExisting();
        return await task(root);
      } finally {
        await root.close();
      }
    }
    managementRepairOptions(binding, observations) {
      return {
        observations,
        readTarget: async (target) => {
          const directory = this.source();
          const db = await this.createDatabase(directory, { ...binding, ...target }, this.mode);
          try {
            return await scanDatabase(db, directory, target.charDbId, target.chatDbId);
          } finally {
            await db.close();
          }
        },
        readRecordFiles: async (record) => {
          if (record.id === null || record.id === "")
            return "absent";
          if (typeof record.id !== "string" || record.scope === "chat" && typeof record.parent !== "string")
            return "unknown";
          const path = record.scope === "char" ? `characters/${record.id}` : `characters/${record.parent}/chats/${record.id}.sqlite`;
          const parts = checkRelativePath(path, "read");
          if (typeof parts === "string" || record.id.includes("/") || typeof record.parent === "string" && record.parent.includes("/"))
            return "unknown";
          return await storageEntryExists(this.source(), path, record.scope === "char" ? "directory" : "file") ? "present" : "absent";
        }
      };
    }
    repairManagement(binding, request) {
      let instruction;
      try {
        this.admit();
        instruction = structuredClone(request);
        if (!instruction || !["prepare", "apply"].includes(instruction.phase) || !instruction.expected || !["light", "rebuild"].includes(instruction.expected.kind) || typeof instruction.expected.evidence !== "string")
          throw new ServiceError({ code: "INVALID_REQUEST", message: "修复清单无效，请重新扫描。" });
      } catch (error) {
        return Promise.reject(error);
      }
      const heavy = instruction.expected.kind === "rebuild";
      if (heavy) {
        this.switching = true;
        this.publish();
      }
      return this.queueChecked(binding, async (captured) => {
        try {
          if (heavy) {
            this.beforeConfigurationChange?.();
            this.beforeManagementRepair?.();
            const deadline = Date.now() + 1e4;
            const wait = async (pending) => {
              let timer;
              try {
                await Promise.race([
                  pending,
                  new Promise((_, reject) => {
                    timer = setTimeout(() => reject(new ServiceError({
                      code: "RESULT_UNCONFIRMED",
                      resultState: "not-applied",
                      retryable: false,
                      message: "数据仍在处理中，本次修复没有开始；请等待完成后重新扫描。"
                    })), Math.max(0, deadline - Date.now()));
                  })
                ]);
              } finally {
                clearTimeout(timer);
              }
            };
            await wait(Promise.all([...this.scopedDatabases.values()].map((entry) => entry.tail)));
            await wait(Promise.all([...this.scopedDatabases.values()].map((entry) => entry.db.waitForMaintenanceSave(Math.max(1, deadline - Date.now())))));
            if (this.database)
              await wait(this.database.waitForMaintenanceSave(Math.max(1, deadline - Date.now())));
          }
          return await this.withMaintenanceRoot(async (root) => {
            const options = this.managementRepairOptions(captured, instruction.observations);
            const plan = await inspectManagementRepair(root, options);
            const stop = (status) => ({
              status,
              plan,
              requiresRescan: true
            });
            if (plan.evidence !== instruction.expected.evidence || plan.kind !== instruction.expected.kind)
              return stop("skipped");
            if (!["light", "rebuild"].includes(plan.kind))
              return stop("blocked");
            if (heavy) {
              const file = await readScanFile(this.source(), GLOBAL_DATABASE);
              const digest = await sha2562(file.bytes);
              if (instruction.phase === "prepare")
                return { status: "prepared", file, digest, plan };
              if (instruction.backupDigest !== digest)
                return stop("skipped");
              const next = { ...this.configuration, configGeneration: this.configuration.configGeneration + 1 };
              if (!Number.isSafeInteger(next.configGeneration))
                throw new ServiceError({
                  code: "CONFIG_FAILED",
                  message: "存储配置编号已超出支持范围，本次修复没有开始。"
                });
              await this.repository.write(next);
              this.configuration = this.registry = next;
              for (const entry of this.scopedDatabases.values())
                await entry.db.close();
              this.scopedDatabases.clear();
              this.targets?.invalidate();
            } else if (instruction.phase !== "apply")
              return stop("blocked");
            const result = await applyManagementRepair(root, instruction.expected, options);
            if (result.status !== "repaired")
              return stop(result.status === "blocked" ? "blocked" : "skipped");
            await root.refresh();
            if ((await inspectManagementRepair(root, options)).kind !== "none")
              throw new ServiceError({
                code: "RESULT_UNCONFIRMED",
                resultState: "unconfirmed",
                retryable: false,
                message: "修复后读回仍有异常，请重新扫描确认当前结果。"
              });
            if (root !== this.database) {
              if (!this.database)
                this.database = await this.createDatabase(this.source(), undefined, this.mode);
              await this.database.refresh();
            }
            this.targets ??= new RootTargets(this.database);
            await this.rootLoaded(this.database, this.targets);
            this.bindDatabase(this.database, this.configuration);
            this.lastError = undefined;
            return { status: "repaired", plan, requiresRescan: true };
          });
        } catch (error) {
          this.lastError = errorData(error);
          throw error;
        }
      }).finally(() => {
        if (heavy)
          this.switching = false;
        this.publish();
      });
    }
    validateMaintenanceTarget(target) {
      if (!target || !["global", "char", "chat"].includes(target.scope))
        throw new ServiceError({ code: "INVALID_REQUEST", message: "维护对象无效，请重新扫描。" });
      if (target.scope === "global")
        validateGlobalTarget(target);
      else
        validateScopedTarget(target);
    }
    restartIdentity(binding, request) {
      let instruction;
      try {
        this.admit();
        instruction = structuredClone(request);
        if (!instruction || !["inspect", "check", "apply"].includes(instruction.phase))
          throw new ServiceError({ code: "INVALID_REQUEST", message: "重新开始清单无效，请重新扫描。" });
      } catch (error) {
        return Promise.reject(error);
      }
      return this.queueChecked(binding, async (captured) => {
        if (!this.database)
          throw new ServiceError({ code: "INSTANCE_DISABLED", message: "请先修复全局库。" });
        return restartIdentity(this.database, instruction, {
          assertAvailable: () => {
            this.beforeConfigurationChange?.();
            this.beforeManagementRepair?.();
          },
          invalidate: (record) => this.invalidateScanReference?.(captured, record),
          pathExists: async (charDbId, chatDbId) => {
            validateScopedTarget({
              ...captured,
              scope: chatDbId ? "chat" : "char",
              charDbId,
              ...chatDbId ? { chatDbId } : {}
            });
            return (await createStorage(this.source(), charDbId, chatDbId, this.mode === "opfs").readSnapshot()).bytes !== null;
          },
          readDatabase: async (charDbId, chatDbId) => {
            const db = await this.createDatabase(this.source(), { ...captured, scope: chatDbId ? "chat" : "char", charDbId, ...chatDbId ? { chatDbId } : {} }, this.mode);
            try {
              return await scanDatabase(db, this.source(), charDbId, chatDbId);
            } finally {
              await db.close();
            }
          }
        });
      });
    }
    maintenanceContext(binding) {
      return {
        directory: this.source(),
        root: this.database,
        managementOptions: this.managementRepairOptions(binding),
        create: (target) => this.createDatabase(this.source(), target.scope === "global" ? undefined : { ...binding, ...target }, this.mode)
      };
    }
    async waitMaintenanceSaves(entries, includeRoot) {
      const deadline = Date.now() + 1e4;
      const wait = async (task) => {
        let timer;
        try {
          await Promise.race([
            task,
            new Promise((_, reject) => {
              timer = setTimeout(() => reject(new ServiceError({
                code: "RESULT_UNCONFIRMED",
                resultState: "not-applied",
                retryable: false,
                message: "数据仍在保存，本次处理没有开始；请等待完成后重新扫描。"
              })), Math.max(0, deadline - Date.now()));
            })
          ]);
        } finally {
          clearTimeout(timer);
        }
      };
      const selected = [...entries];
      await wait(Promise.all(selected.map((entry) => entry.tail)));
      await wait(Promise.all(selected.map((entry) => entry.db.waitForMaintenanceSave(Math.max(1, deadline - Date.now())))));
      if (includeRoot && this.database)
        await wait(this.database.waitForMaintenanceSave(Math.max(1, deadline - Date.now())));
    }
    maintainDatabase(binding, request) {
      let instruction;
      try {
        this.admit();
        instruction = structuredClone(request);
        this.validateMaintenanceTarget(instruction?.expected?.target);
        if (!["prepare", "apply"].includes(instruction.phase) || !["repair", "reset", "reconstruct"].includes(instruction.expected.kind) || typeof instruction.expected.evidence !== "string")
          throw new ServiceError({ code: "INVALID_REQUEST", message: "维护清单无效，请重新扫描。" });
      } catch (error) {
        return Promise.reject(error);
      }
      const target = instruction.expected.target, global = target.scope === "global";
      const fixed = { ...binding, ...target };
      if (global) {
        this.switching = true;
        this.publish();
      } else {
        try {
          this.assertIdentityTargetAvailable(fixed);
        } catch (error) {
          return Promise.reject(error);
        }
        this.sealCleanup(fixed);
      }
      return this.queueChecked(binding, async (captured) => {
        let changedFile = false;
        try {
          if (global) {
            this.beforeConfigurationChange?.();
            this.beforeManagementRepair?.();
          } else
            for (const record of instruction.expected.records) {
              if (record.state === "deleted")
                continue;
              this.beforeScanRepair?.(captured, record.scope === "char" ? {
                scope: "char",
                phase: "check",
                avatar: record.avatar,
                charDbId: target.charDbId,
                expectedRole: record,
                expectedTarget: null
              } : {
                scope: "chat",
                phase: "check",
                avatar: record.avatar,
                file: record.file,
                charDbId: target.charDbId,
                chatDbId: target.scope === "chat" ? target.chatDbId : record.id,
                expectedRole: null,
                expectedChat: record,
                expectedTarget: null
              });
            }
          const entry = this.scopedDatabases.get(bindingKey(fixed));
          await this.waitMaintenanceSaves(global ? this.scopedDatabases.values() : entry ? [entry] : [], global || instruction.expected.kind === "reset");
          const inspected = await inspectDatabaseMaintenance(this.maintenanceContext(captured), target, instruction);
          const plan = inspected.plan;
          const stop = (status) => ({
            status,
            plan,
            requiresRescan: true
          });
          if (plan.kind !== instruction.expected.kind || plan.evidence !== instruction.expected.evidence)
            return stop("skipped");
          if (!["repair", "reset", "reconstruct"].includes(plan.kind))
            return stop("blocked");
          const backup = await maintenanceBackup(this.source(), plan);
          if (instruction.phase === "prepare")
            return { status: "prepared", plan, ...backup };
          if (backup.file && backup.digest !== instruction.backupDigest)
            return stop("skipped");
          if (global) {
            const next = { ...this.configuration, configGeneration: this.configuration.configGeneration + 1 };
            if (!Number.isSafeInteger(next.configGeneration))
              throw new ServiceError({ code: "CONFIG_FAILED", message: "存储配置编号超出范围，本次处理没有开始。" });
            await this.repository.write(next);
            this.configuration = this.registry = next;
            for (const value of this.scopedDatabases.values())
              await value.db.close();
            this.scopedDatabases.clear();
            await this.database?.close();
            this.targets?.invalidate();
            const root = await this.createDatabase(next.mode === "indexeddb" ? next : next.directory, undefined, this.mode);
            try {
              if (plan.kind !== "reset")
                await root.openExisting();
              changedFile = true;
              await applyGlobalReconstruction(root, inspected.facts, instruction.discovery, plan.kind === "reset", plan.file === "missing");
              this.database = root;
              this.targets = new RootTargets(root);
              await this.rootLoaded(root, this.targets);
              this.bindDatabase(root, next);
              this.lastError = undefined;
            } catch (error) {
              await root.close();
              throw error;
            }
          } else {
            if (!this.database)
              return stop("blocked");
            if (entry) {
              await entry.db.close();
              this.scopedDatabases.delete(bindingKey(fixed));
            }
            if (plan.kind === "repair") {
              const db = await this.createDatabase(this.source(), fixed, this.mode);
              try {
                await db.openExisting();
                const registration = await this.targets.read(fixed);
                const requireIdentity = registration?.origin === "generated" || plan.records.some((r) => r.origin === "generated");
                const repaired = await applyScopedRepair(db, { identity: target, expected: plan.scopedRepair }, { requireIdentity });
                if (repaired.status !== "repaired" && repaired.status !== "unchanged")
                  return stop("skipped");
                changedFile = true;
                await db.refresh();
              } finally {
                await db.close();
              }
            } else {
              if (plan.file === "present") {
                await createStorage(this.source(), target.charDbId, target.scope === "chat" ? target.chatDbId : undefined, this.mode === "opfs").remove();
                changedFile = true;
              }
              const commands = [
                {
                  sql: `INSERT INTO ${TARGETS}(scope,char_dbid,chat_dbid,origin,state) VALUES(?,?,?,'generated','never') ON CONFLICT(scope,char_dbid,chat_dbid) DO UPDATE SET origin='generated',state='never'`,
                  binds: [target.scope, target.charDbId, target.scope === "chat" ? target.chatDbId : ""]
                }
              ];
              for (const record of plan.records) {
                if (!Number.isSafeInteger((record.generation ?? 0) + 1))
                  throw new ServiceError({ code: "INVALID_REQUEST", message: "关联代次超出范围，本次处理未能完成。" });
                commands.push({
                  sql: `UPDATE ${record.scope === "char" ? ROLES : CHATS} SET generation=generation+1,confirmed=1,origin='generated' WHERE ${record.scope === "char" ? "role_id" : "chat_id"}=? AND generation=?`,
                  binds: [record.referenceId, record.generation],
                  kind: "write",
                  expectChanges: 1
                });
                this.invalidateScanReference?.(captured, record);
              }
              this.targets?.invalidate();
              await this.database.transaction(commands, undefined, { management: true });
              const savedRoot = await this.createDatabase(this.source(), undefined, this.mode);
              try {
                await savedRoot.openExisting();
                const saved = await scanRecords(savedRoot, storageName(this.source()));
                const savedTarget = saved.targets.find((t) => t.scope === target.scope && t.charDbId === target.charDbId && (t.chatDbId ?? "") === (target.scope === "chat" ? target.chatDbId : ""));
                if (saved.management !== "valid" || savedTarget?.origin !== "generated" || savedTarget.state !== "never" || plan.records.some((previous) => !saved.records.some((r) => r.scope === previous.scope && r.referenceId === previous.referenceId && r.id === previous.id && r.parent === previous.parent && r.generation === previous.generation + 1 && r.confirmed && r.origin === "generated")))
                  throw new ServiceError({
                    code: "RESULT_UNCONFIRMED",
                    resultState: "unconfirmed",
                    message: "新的登记已提交，但文件读回未能确认；请重新扫描。"
                  });
              } finally {
                await savedRoot.close();
              }
              if ((await scanFile(this.source(), target.charDbId, target.scope === "chat" ? target.chatDbId : undefined)).status !== "missing")
                throw new ServiceError({
                  code: "RESULT_UNCONFIRMED",
                  resultState: "unconfirmed",
                  message: "处理后仍发现旧数据文件，请重新扫描。"
                });
            }
          }
          return { status: plan.kind === "reset" ? "reset" : "repaired", plan, requiresRescan: true };
        } catch (error) {
          this.lastError = errorData(error);
          if (changedFile)
            return {
              status: "partial",
              plan: instruction.expected,
              requiresRescan: true,
              message: `部分处理已提交，尚未完成全部确认；请重新扫描，不要重复执行。${errorData(error).message}`
            };
          throw error;
        }
      }).finally(() => {
        if (global)
          this.switching = false;
        else
          this.releaseCleanup(fixed);
        this.publish();
      });
    }
    repairScan(binding, request) {
      let instruction;
      try {
        this.admit();
        instruction = structuredClone(request);
        validateScanRepair(instruction);
      } catch (error) {
        return Promise.reject(error);
      }
      return this.queueChecked(binding, async (captured) => {
        if (!this.database)
          throw new ServiceError({ code: "INSTANCE_DISABLED", message: "管理数据库尚未恢复。" });
        const assertAvailable = () => {
          this.beforeScanRepair?.(captured, instruction);
          const ids = new Set(instruction.scope === "chat" ? [instruction.chatDbId, instruction.expectedChat?.id].filter(Boolean) : []);
          for (const [key, entry] of this.scopedDatabases) {
            const fixed = JSON.parse(key);
            if (fixed[0] !== captured.storageId || fixed[1] !== captured.configGeneration || fixed[3] !== instruction.charDbId)
              continue;
            if ((fixed[2] === "chat" && ids.has(fixed[4]) || fixed[2] === "char" && (instruction.scope === "char" || instruction.expectedRole?.initialization !== "ready")) && (entry.pending || entry.db.hasPendingFirstCommit))
              throw new ServiceError({
                code: "RESULT_UNCONFIRMED",
                resultState: "not-applied",
                message: "这份数据仍在处理中，请等待当前操作结束后重新扫描。"
              });
          }
        };
        const readDatabase = async (charDbId, chatDbId) => {
          const directory = this.source();
          const db = await this.createDatabase(directory, { ...captured, scope: chatDbId ? "chat" : "char", charDbId, ...chatDbId ? { chatDbId } : {} }, this.mode);
          try {
            return await scanDatabase(db, directory, charDbId, chatDbId);
          } finally {
            await db.close();
          }
        };
        const result = await repairScanRegistration(this.database, instruction, readDatabase, assertAvailable, (record) => this.invalidateScanReference?.(captured, record));
        if (instruction.phase === "apply" && (result.status === "repaired" || result.status === "unchanged"))
          this.scanRepairCompleted?.(captured, instruction);
        return result;
      });
    }
    async scanEntryBasis(relativePath, entry) {
      if (!this.database)
        throw new ServiceError({ code: "INSTANCE_DISABLED", message: "管理数据库尚未恢复，拒绝删除扫描条目。" });
      await new RootTargets(this.database, true).ready();
      return scanEntryHasBasis(relativePath, entry, await readScanBasis(this.database));
    }
    removeScanEntry(binding, request) {
      try {
        this.admit();
      } catch (error) {
        return Promise.reject(error);
      }
      const captured = { ...binding }, relativePath = request?.relativePath, kind = request?.entry;
      const segments = checkRelativePath(relativePath, "remove");
      if (typeof segments === "string" || !["file", "directory"].includes(kind))
        return Promise.reject(new ServiceError({
          code: "INVALID_REQUEST",
          message: typeof segments === "string" ? segments : "扫描条目类型无效。"
        }));
      const skipped = (message) => ({ relativePath, status: "skipped", message });
      const registered = "已有登记，未删除。";
      const check = async () => {
        this.checkBinding(captured);
        await this.requirePermission();
        return this.scanEntryBasis(relativePath, kind);
      };
      const part = kind === "file" ? parseDatabasePath(relativePath, "file") : undefined;
      const fixed = part?.kind === "char" && isUuid(part.charDbId) ? { scope: "char", charDbId: part.charDbId } : part?.kind === "chat" && isUuid(part.charDbId) && isUuid(part.chatDbId) ? { scope: "chat", charDbId: part.charDbId, chatDbId: part.chatDbId } : undefined;
      const target = fixed && {
        storageId: captured.storageId,
        configGeneration: captured.configGeneration,
        ...fixed
      };
      return (async () => {
        if (await this.enqueue(check))
          return skipped(registered);
        if (target)
          this.sealCleanup(target);
        try {
          if (target)
            await this.drainCleanup(target);
          return await this.enqueue(async () => {
            if (await check())
              return skipped(registered);
            const outcome = await removeStorageEntry(this.source(), segments, kind);
            if (outcome === "not-empty")
              return skipped("目录不为空，未删除。");
            return {
              relativePath,
              status: outcome,
              message: outcome === "removed" ? "已删除。" : "已不存在。"
            };
          });
        } finally {
          if (target)
            this.releaseCleanup(target);
        }
      })();
    }
    removeScanTarget(binding, target) {
      try {
        this.admit();
      } catch (error) {
        return Promise.reject(error);
      }
      const expected = target && { ...target };
      if (!expected || !["char", "chat"].includes(expected.scope) || !isUuid(expected.charDbId) || (expected.scope === "chat" ? !isUuid(expected.chatDbId) : expected.chatDbId !== undefined) || !["generated", "legacy"].includes(expected.origin) || !["never", "creating", "ready"].includes(expected.state))
        return Promise.reject(new ServiceError({ code: "INVALID_REQUEST", message: "初始化登记参数无效。" }));
      return this.queueChecked(binding, async () => {
        if (!this.database || !this.targets)
          throw new ServiceError({ code: "INSTANCE_DISABLED", message: "管理数据库尚未恢复。" });
        await new RootTargets(this.database, true).ready();
        return await new RootEntities(this.database, this.targets).deletions.removeOrphanTarget(expected) ? { status: "removed", message: "初始化登记已删除并确认保存。" } : { status: "skipped", message: "登记已变化，未删除。" };
      });
    }
    execute(binding, task) {
      return this.schedule(binding, (db, lifecycle) => lifecycle ? lifecycle.read(task) : task(db));
    }
    inspect(binding, task) {
      return this.schedule(binding, (db, lifecycle) => lifecycle ? lifecycle.inspect(task, new RootTargets(this.database, true)) : task(db));
    }
    executeWrite(binding, commands, callId, onCommitted) {
      let snapshot;
      try {
        snapshot = structuredClone(commands);
      } catch (error) {
        return Promise.reject(beforeBusinessSqlError(error));
      }
      return this.schedule(binding, async (db, lifecycle) => {
        if (lifecycle)
          return lifecycle.write(snapshot, callId, onCommitted, () => this.assertScoped(binding));
        try {
          await this.targets.ready();
        } catch (error) {
          throw beforeBusinessSqlError(error);
        }
        return db.transaction(snapshot, onCommitted);
      }, true);
    }
    executeBatch(binding, task) {
      return this.schedule(binding, async (db, lifecycle) => {
        if (!lifecycle) {
          try {
            await this.targets.ready();
          } catch (error) {
            throw beforeBusinessSqlError(error);
          }
        }
        return task((commands, callId, onCommitted) => lifecycle ? lifecycle.write(commands, callId, onCommitted, () => this.assertScoped(binding)) : db.transaction(commands, onCommitted));
      }, true);
    }
    assertScoped(binding) {
      if (this.cleanupSeals.has(bindingKey(binding)))
        throw new ServiceError({
          code: "STALE_IDENTITY",
          resultKind: "identity",
          resultState: "not-applied",
          message: "该数据库正在清理，本次 SQL 未执行。"
        });
      this.beforeScopedExecution?.(binding);
    }
    sealCleanup(binding) {
      this.cleanupSeals.add(bindingKey(binding));
    }
    releaseCleanup(binding) {
      this.cleanupSeals.delete(bindingKey(binding));
    }
    assertIdentityTargetAvailable(binding) {
      if (this.cleanupSeals.has(bindingKey(binding)))
        throw new ServiceError({
          code: "STALE_IDENTITY",
          resultKind: "identity",
          resultState: "not-applied",
          message: "该 UUID 的数据库正在清理，不能登记新的访问引用。"
        });
    }
    async drainCleanup(binding) {
      await this.queueChecked(binding, async () => {});
      const entry = this.scopedDatabases.get(bindingKey(binding));
      if (entry) {
        await entry.tail;
        await entry.db.close();
        this.scopedDatabases.delete(bindingKey(binding));
      }
    }
    removeCleanupFile(binding, authorize = async () => {}) {
      return this.queueChecked(binding, async () => {
        validateScopedTarget(binding);
        if (!this.cleanupSeals.has(bindingKey(binding)) || this.scopedDatabases.has(bindingKey(binding)))
          throw new ServiceError({
            code: "RESULT_UNCONFIRMED",
            resultState: "unconfirmed",
            message: "文件清理尚未完成排空，拒绝删除。"
          });
        if (!this.database || !this.targets)
          throw new ServiceError({ code: "INSTANCE_DISABLED", message: "root 尚未恢复，拒绝文件清理。" });
        await authorize(new RootEntities(this.database, this.targets));
        await createStorage(this.source(), binding.charDbId, binding.chatDbId, this.mode === "opfs").remove();
      });
    }
    registerGenerated(binding) {
      return this.admitted(binding, async (captured) => {
        validateScopedTarget(captured);
        if (!this.database || !this.targets)
          throw new ServiceError({ code: "INSTANCE_DISABLED", message: "root 文件尚未恢复。" });
        await this.targets.registerGenerated(captured);
      });
    }
    registerPreparedRole(binding) {
      return this.registerUnrecorded(binding, () => {
        throw new ServiceError({
          code: "IDENTITY_CONFLICT",
          resultKind: "identity",
          resultState: "not-applied",
          message: "新角色编号对应的数据库文件已经存在且没有登记，未覆盖或接入该文件。"
        });
      });
    }
    registerObserved(binding) {
      return this.registerUnrecorded(binding, () => {});
    }
    registerUnrecorded(binding, existing) {
      return this.admitted(binding, async (captured) => {
        validateScopedTarget(captured);
        if (!this.database || !this.targets)
          throw new ServiceError({ code: "INSTANCE_DISABLED", message: "全局数据库尚未恢复。" });
        if (await this.targets.read(captured))
          return;
        const db = await this.createDatabase(this.source(), captured, this.mode);
        try {
          if (await db.fileExists())
            existing();
          else
            await this.targets.registerGenerated(captured);
        } finally {
          await db.close();
        }
      });
    }
    refresh(binding) {
      const captured = { ...binding };
      try {
        this.admit();
        this.checkBinding(captured);
        if (!captured.scope || captured.scope === "global") {
          validateGlobalTarget(captured);
          this.database?.cancelPendingSaveForReload();
        } else {
          validateScopedTarget(captured);
          this.assertScoped(captured);
          this.scopedDatabases.get(bindingKey(captured))?.db.cancelPendingSaveForReload();
        }
      } catch (error) {
        return Promise.reject(error);
      }
      return this.schedule(captured, async (db, lifecycle) => {
        if (lifecycle)
          await lifecycle.refresh();
        else {
          await db.refresh();
          await this.rootLoaded(db, this.targets);
        }
        return { reloaded: true };
      });
    }
    updateReloadTimer() {
      if (this.reloadTimer) {
        clearInterval(this.reloadTimer);
        this.reloadTimer = undefined;
      }
      if (this.mode !== "directory" || !this.autoReloadEnabled || !this.configuration)
        return;
      this.reloadTimer = setInterval(() => {
        this.pollChanges();
      }, 2000);
      this.reloadTimer.unref?.();
    }
    pollChanges() {
      if (this.reloadPending || this.switching || this.mode !== "directory" || !this.autoReloadEnabled || !this.configuration)
        return Promise.resolve();
      this.reloadPending = true;
      return this.enqueue(async () => {
        if (this.switching || this.mode !== "directory" || !this.autoReloadEnabled || !this.configuration)
          return;
        await Promise.allSettled([...this.scopedDatabases.values()].map((entry) => entry.tail));
        let changed = false;
        try {
          await this.requirePermission();
          if (this.database?.availability === "ready" && await this.database.refreshIfChanged()) {
            await this.rootLoaded(this.database, this.targets);
            changed = true;
          }
          for (const entry of this.scopedDatabases.values())
            if (entry.db.availability === "ready") {
              try {
                changed = await entry.lifecycle.refresh(true) || changed;
              } catch (error) {
                this.lastError = errorData(error);
                changed = true;
              }
            }
        } catch (error) {
          this.lastError = errorData(error);
          changed = true;
        }
        if (changed)
          this.publish();
      }).finally(() => {
        this.reloadPending = false;
      });
    }
    schedule(binding, task, businessWrite = false) {
      try {
        this.admit();
      } catch (error) {
        return Promise.reject(businessWrite ? beforeBusinessSqlError(error) : error);
      }
      const captured = binding && { ...binding };
      const admitted = this.enqueue(async () => {
        let taskStarted = false;
        try {
          this.checkBinding(captured);
          await this.requirePermission();
          if (captured.scope !== undefined && !["global", "char", "chat"].includes(captured.scope))
            throw new ServiceError({
              code: "INVALID_REQUEST",
              failureKind: "request-rejected",
              message: "此数据库层级未实现。"
            });
          if (!captured.scope || captured.scope === "global") {
            validateGlobalTarget(captured);
            if (!this.database)
              throw new ServiceError({ code: "INSTANCE_DISABLED", message: "文件尚未恢复。" });
            if (this.database.availability === "ready")
              await this.database.assertFileExisting();
            taskStarted = true;
            try {
              const value = await task(this.database);
              this.lastError = undefined;
              return { operation: Promise.resolve(value) };
            } catch (error) {
              this.lastError = errorData(error);
              throw error;
            } finally {
              this.publish();
            }
          }
          validateScopedTarget(captured);
          this.assertScoped(captured);
          if (!this.database || !this.targets)
            throw new ServiceError({ code: "INSTANCE_DISABLED", message: "root 文件尚未恢复。" });
          const targets = this.targets;
          const targetKey = bindingKey(captured);
          let entry = this.scopedDatabases.get(targetKey);
          if (!entry) {
            const db = await this.createDatabase(this.source(), captured, this.mode);
            this.bindDatabase(db, captured);
            entry = {
              db,
              lifecycle: new TargetLifecycle(captured, db, targets),
              tail: Promise.resolve(),
              pending: 0,
              used: Date.now()
            };
            this.scopedDatabases.set(targetKey, entry);
          }
          const fixed = entry;
          fixed.pending++;
          const operation = fixed.tail.then(() => {
            try {
              this.assertScoped(captured);
            } catch (error) {
              throw businessWrite ? beforeBusinessSqlError(error) : error;
            }
            return task(fixed.db, fixed.lifecycle);
          }).finally(() => {
            fixed.pending--;
            fixed.used = Date.now();
          });
          fixed.tail = operation.catch(() => {
            return;
          });
          return { operation };
        } catch (error) {
          throw businessWrite && !taskStarted ? beforeBusinessSqlError(error) : error;
        }
      });
      return admitted.then((result) => result.operation);
    }
    releaseIdle(now = Date.now()) {
      return this.enqueue(async () => {
        for (const [id, entry] of this.scopedDatabases)
          if (!entry.pending && now - entry.used >= 60000) {
            try {
              await entry.db.close();
              this.scopedDatabases.delete(id);
            } catch {}
          }
      });
    }
    drainForRestart() {
      return this.enqueue(async () => {
        if (this.switching)
          throw new ServiceError({ code: "CONFIG_CHANGING", message: "目录切换尚未完成。" });
        await Promise.all([...this.scopedDatabases.values()].map((entry) => entry.tail));
        await Promise.all([...this.scopedDatabases.values()].map((entry) => entry.db.drain()));
        await this.database?.drain();
      });
    }
    resume(binding) {
      try {
        this.admit();
      } catch (error) {
        return Promise.reject(error);
      }
      const captured = binding && { ...binding };
      return this.enqueue(async () => {
        this.checkBinding(captured);
        try {
          await this.requirePermission();
          await this.loadDatabase();
          this.lastError = undefined;
          return this.info();
        } catch (error) {
          this.lastError = errorData(error);
          throw error;
        } finally {
          this.publish();
        }
      });
    }
    async closeForRestart(authorize) {
      return this.enqueue(async () => {
        if (this.switching)
          throw new ServiceError({ code: "CONFIG_CHANGING", message: "目录切换尚未完成。" });
        await Promise.all([...this.scopedDatabases.values()].map((entry) => entry.tail));
        const databases = [...this.scopedDatabases.values()].map((entry) => entry.db);
        if (this.database)
          databases.push(this.database);
        const cancelled = databases.map((db) => db.sealBackgroundSaves());
        try {
          await Promise.all(databases.map((db) => db.drain()));
          authorize();
          for (const db of databases)
            db.closeForRestart();
          this.database = undefined;
          this.targets = undefined;
          this.scopedDatabases.clear();
          if (this.reloadTimer) {
            clearInterval(this.reloadTimer);
            this.reloadTimer = undefined;
          }
        } catch (error) {
          for (let i = 0;i < databases.length; i++)
            if (databases[i].availability === "ready")
              databases[i].resumeBackgroundSaves(cancelled[i]);
          this.lastError = errorData(error);
          this.publish();
          throw error;
        }
      });
    }
  }

  // src/worker/restart-coordinator.ts
  class RestartCoordinator {
    post;
    drain;
    timeoutMs;
    attempt;
    automaticTargets = new Set;
    constructor(post, drain, timeoutMs = 30000) {
      this.post = post;
      this.drain = drain;
      this.timeoutMs = timeoutMs;
    }
    get state() {
      return this.attempt?.state ?? "idle";
    }
    assertParticipant(port) {
      if (this.attempt && !this.attempt.participants.has(port))
        this.assertAdmission(port);
    }
    cancelAttempt(port, attemptId) {
      if (this.attempt?.id === attemptId && this.attempt.participants.has(port))
        this.cancel();
    }
    assertAdmission(port) {
      const a = this.attempt;
      if (a && (a.state !== "preparing" || a.participants.get(port) !== false)) {
        throw new ServiceError({ code: "SERVICE_RESTARTING", message: "全局准备期间该连接尚未就绪或已封住业务入口。" });
      }
    }
    prepare(targetBuildId, ports, automatic = false, purpose = "update") {
      const existing = this.attempt;
      if (existing) {
        if (automatic)
          this.automaticTargets.add(targetBuildId);
        if (existing.targetBuildId === targetBuildId && existing.purpose === purpose)
          return existing.promise;
        const error = new ServiceError({
          code: "PROTOCOL_MISMATCH",
          message: "多个页面请求不同目标 UUID，请加载一致构建后重试。"
        });
        this.cancel(error.data);
        return Promise.reject(error);
      }
      if (automatic && this.automaticTargets.has(targetBuildId))
        return Promise.reject(new ServiceError({ code: "SERVICE_RESTARTING", message: "该目标 UUID 已自动尝试；修复阻塞后请显式安全重试。" }));
      if (automatic)
        this.automaticTargets.add(targetBuildId);
      let resolve, reject;
      const promise = new Promise((yes, no) => {
        resolve = yes;
        reject = no;
      });
      promise.catch(() => {});
      const a = {
        id: randomUuid(),
        targetBuildId,
        purpose,
        participants: new Map([...ports].map((p) => [p, false])),
        state: "preparing",
        promise,
        resolve,
        reject,
        timer: setTimeout(() => {
          if (this.attempt === a)
            this.cancel({ code: "SERVICE_RESTARTING", message: "全局准备超过 30 秒上限；没有取消正在执行的写入。" });
        }, this.timeoutMs)
      };
      this.attempt = a;
      for (const port of a.participants.keys()) {
        if (this.attempt !== a)
          break;
        try {
          this.post(port, { type: "restart-event", phase: "prepare", attemptId: a.id, targetBuildId, purpose });
        } catch {
          this.disconnected(port);
        }
      }
      this.finish(a);
      return promise;
    }
    reply(port, attemptId, error) {
      const a = this.attempt;
      if (!a || a.id !== attemptId || a.state !== "preparing" || !a.participants.has(port))
        return;
      if (error) {
        this.cancel(error);
        return;
      }
      a.participants.set(port, true);
      this.finish(a);
    }
    disconnected(port) {
      if (this.attempt?.state === "exiting")
        return;
      if (this.attempt?.participants.has(port))
        this.cancel({ code: "CONNECTION_FAILED", message: "准备参与页面失联，不能确认全局排空。" });
    }
    cancel(error = { code: "SERVICE_RESTARTING", message: "全局准备已取消；原写入及身份工作继续。" }) {
      const a = this.attempt;
      if (!a)
        return;
      if (a.state === "exiting")
        return;
      this.attempt = undefined;
      clearTimeout(a.timer);
      a.reject(new ServiceError(error));
      for (const port of a.participants.keys()) {
        try {
          this.post(port, {
            type: "restart-event",
            phase: "cancel",
            attemptId: a.id,
            targetBuildId: a.targetBuildId,
            purpose: a.purpose,
            error
          });
        } catch {}
      }
    }
    commit(port, attemptId, close, exit) {
      const a = this.attempt;
      const valid = () => this.attempt === a && a?.id === attemptId && a.participants.has(port) && a.state === "prepared";
      if (!a || !valid())
        return Promise.reject(new ServiceError({ code: "SERVICE_RESTARTING", message: "当前全局准备屏障已失效，拒绝关闭或退出。" }));
      if (a.commit)
        return a.commit;
      a.commit = (async () => {
        try {
          await close(() => {
            if (!valid())
              throw new ServiceError({ code: "SERVICE_RESTARTING", message: "关闭前屏障已取消或参与页面失联。" });
            a.state = "exiting";
          });
          for (const p of a.participants.keys()) {
            try {
              this.post(p, {
                type: "restart-event",
                phase: "exit",
                attemptId: a.id,
                targetBuildId: a.targetBuildId,
                purpose: a.purpose
              });
            } catch {}
          }
          exit();
        } catch (error) {
          if (this.attempt === a) {
            a.state = "prepared";
            this.cancel(errorData(error));
          }
          throw error;
        }
      })();
      return a.commit;
    }
    finish(a) {
      if (this.attempt !== a || a.state !== "preparing" || [...a.participants.values()].some((done) => !done))
        return;
      a.state = "draining";
      this.drain().then(() => {
        if (this.attempt !== a)
          return;
        a.state = "prepared";
        clearTimeout(a.timer);
        a.resolve({ prepared: true, attemptId: a.id, targetBuildId: a.targetBuildId, purpose: a.purpose });
      }, (error) => {
        if (this.attempt === a)
          this.cancel(errorData(error));
      });
    }
  }

  // src/worker/write-commands.ts
  function sqlCommand(input, mode) {
    if (!input || typeof input !== "object")
      return invalidRequest();
    checkPrefix(input.sql, mode);
    return { sql: input.sql, binds: validateSerializedBinds(input.binds), mode };
  }
  function writeCommands(operation) {
    if (operation.type === "checked-transaction") {
      validateCheckedCommands(operation.commands);
      return operation.commands.map((input) => ({
        kind: input.kind,
        sql: input.sql,
        binds: validateSerializedBinds(input.binds),
        ...input.kind === "write" ? {
          mode: "transaction",
          ...input.expectChanges === undefined ? {} : { expectChanges: input.expectChanges }
        } : {}
      }));
    }
    if (operation.type === "update")
      return [sqlCommand(operation, "update")];
    if (operation.type === "exec") {
      checkPrefix(operation.sql, "exec");
      return [{ sql: operation.sql, mode: "exec" }];
    }
    if (operation.type === "runSql") {
      const list = Array.isArray(operation.sql) ? operation.sql : [operation.sql];
      if (!list.length || list.some((sql) => typeof sql !== "string"))
        return invalidRequest();
      return list.map((sql) => ({ sql, mode: "runSql" }));
    }
    if (operation.type === "transaction") {
      if (!Array.isArray(operation.commands) || !operation.commands.length)
        return invalidRequest();
      return operation.commands.map((input) => {
        if (!input || typeof input !== "object")
          return invalidRequest();
        return sqlCommand(input, "transaction");
      });
    }
    return invalidRequest();
  }

  // src/worker/character-identities.ts
  class CharacterIdentities {
    beforeIssue;
    beforeRelease;
    entities = new Map;
    confirmed = new Set;
    constructor(beforeIssue = async () => {}, beforeRelease = () => {}) {
      this.beforeIssue = beforeIssue;
      this.beforeRelease = beforeRelease;
    }
    hasLease(entity) {
      const entry = this.entities.get(entity);
      return !!entry?.token || !!entry?.waiters.length;
    }
    hasWorkFor(matches) {
      return [...this.entities].some(([entity, entry]) => matches(entity) && (!!entry.token || !!entry.waiters.length));
    }
    forget(entity) {
      this.entities.delete(entity);
    }
    seed(entity, id) {
      if (!this.entities.has(entity))
        this.entities.set(entity, { id, waiters: [] });
    }
    assertSettled() {
      if ([...this.entities.values()].some((entry) => entry.token || entry.waiters.length))
        throw identityFailure("仍有角色或聊天 UUID 初始化未完成，不能排空服务；请等待保存及 Worker 登记结束。", "unconfirmed");
    }
    acquire(entity, observed, owner) {
      if (!entity || observed !== null && !isUuid(observed))
        return Promise.reject(identityFailure("Worker 收到无效的角色或聊天目标名称或 UUID，未开始初始化；请重新取得目标并读回服务器 UUID。"));
      observed = observed?.toLowerCase() ?? null;
      let entry = this.entities.get(entity);
      if (entry?.token) {
        if (observed && observed !== entry.id)
          return Promise.reject(identityFailure("读回的 UUID 与另一页面正在初始化的 UUID 不一致，未改写 UUID；请重新读回服务器结果。"));
        return new Promise((resolve, reject) => entry.waiters.push({ resolve, reject }));
      }
      if (!observed && entry && this.confirmed.has(entry.id))
        return Promise.resolve({ identityId: entry.id });
      if (observed) {
        this.confirmed.add(observed);
        this.entities.set(entity, { id: observed, waiters: [] });
        return Promise.resolve({ identityId: observed });
      }
      entry ??= { id: randomUuid(), waiters: [] };
      entry.token = randomUuid();
      entry.owner = owner;
      this.entities.set(entity, entry);
      const candidate = entry, token = entry.token;
      return this.beforeIssue(candidate.id, entity).then(() => {
        this.beforeRelease(entity);
        if (candidate.token !== token || candidate.owner !== owner)
          throw identityFailure("UUID 凭据所属连接已断开，未开始保存酒馆身份。");
        return { identityId: candidate.id, token };
      }).catch((error) => {
        if (candidate.token === token && candidate.owner === owner) {
          this.settle(entity, token, false, owner);
        }
        throw error;
      });
    }
    pendingTicket(entity, token, owner) {
      const entry = this.entities.get(entity);
      if (!entry || entry.token !== token || entry.owner !== owner)
        throw identityFailure("Worker 拒绝 UUID 登记：初始化凭据已失效或属于另一连接；请重新读回服务器 UUID 并取得目标。");
      return { identityId: entry.id };
    }
    settle(entity, token, confirmed, owner) {
      const result = this.pendingTicket(entity, token, owner);
      const entry = this.entities.get(entity);
      entry.token = undefined;
      entry.owner = undefined;
      if (confirmed) {
        this.confirmed.add(entry.id);
        for (const waiter of entry.waiters)
          waiter.resolve(result);
      } else
        for (const waiter of entry.waiters)
          waiter.reject(identityFailure("另一页面未完成 UUID 保存及登记，无法确认服务器结果；请重新读回原 UUID 后再尝试。", "unconfirmed"));
      entry.waiters = [];
      return result;
    }
    disconnect(owner) {
      for (const [entity, entry] of this.entities)
        if (entry.owner === owner && entry.token)
          this.settle(entity, entry.token, false, owner);
    }
  }

  // src/worker/identity-requests.ts
  function createIdentityRequests({
    storage,
    entities,
    deletions,
    renames,
    chatIdentities
  }) {
    function chats(binding, entity) {
      for (const [key, existing] of chatIdentities) {
        const values = JSON.parse(key);
        if (values[0] === binding.storageId && values[1] === binding.configGeneration && values[2] === binding.charDbId && existing.hasLease(entity))
          return existing;
      }
      const domain = JSON.stringify([
        binding.storageId,
        binding.configGeneration,
        binding.charDbId,
        binding.entityRevision ?? 0
      ]);
      let coordinator = chatIdentities.get(domain);
      if (!coordinator) {
        coordinator = new CharacterIdentities((id, entity) => entities.propose(binding, entity, id), (entity) => deletions.assertEntity(binding, entity, true));
        chatIdentities.set(domain, coordinator);
      }
      return coordinator;
    }
    const deletionFailure = (error) => ["STALE_IDENTITY", "ENTITY_DELETE_PENDING", "ENTITY_DELETE_UNCONFIRMED"].includes(errorData(error).code);
    function deletedIdentity() {
      return new ServiceError({
        code: "STALE_IDENTITY",
        resultKind: "identity",
        message: "原角色或聊天已经收到删除通知，原身份 HTTP 已结束，但不会恢复这个引用。"
      });
    }
    async function finishIdentityAcquisition(binding, entity, chat, ticket, coordinator, owner) {
      try {
        const generation = await entities.generation(binding, entity, chat);
        deletions.assertEntity(binding, entity, chat);
        if (ticket.token)
          coordinator.pendingTicket(entity, ticket.token, owner);
        return { ...ticket, generation, referenceId: (await entities.credential(binding, entity, chat)).referenceId };
      } catch (error) {
        if (ticket.token) {
          let current = false;
          try {
            coordinator.pendingTicket(entity, ticket.token, owner);
            current = true;
          } catch {}
          if (current) {
            coordinator.settle(entity, ticket.token, false, owner);
          }
        }
        throw error;
      }
    }
    async function settleIdentity(binding, entity, token, confirmed, chat, coordinator, owner) {
      if (!confirmed) {
        const ticket = coordinator.settle(entity, token, false, owner);
        if (chat)
          await entities.verify(binding, true);
        await deletions.verify(binding, entity, chat);
        return { ...ticket, ...await entities.credential(binding, entity, chat) };
      }
      try {
        if (chat)
          await entities.verify(binding, true);
        await deletions.verify(binding, entity, chat);
        deletions.assertEntity(binding, entity, chat);
      } catch (error) {
        if (!deletionFailure(error))
          throw error;
        coordinator.settle(entity, token, false, owner);
        throw deletedIdentity();
      }
      const ticket = coordinator.pendingTicket(entity, token, owner);
      try {
        await entities.confirm(binding, entity, ticket.identityId, chat);
        deletions.assertEntity(binding, entity, chat);
      } catch (error) {
        if (!deletionFailure(error))
          throw error;
        coordinator.settle(entity, token, false, owner);
        throw deletedIdentity();
      }
      coordinator.settle(entity, token, true, owner);
      return { ...ticket, ...await entities.credential(binding, entity, chat) };
    }
    async function restore(request) {
      const b = request.binding;
      if (!b || !isUuid(b.charDbId) || !["char", "chat"].includes(b.scope ?? "") || (b.scope === "char" ? b.chatDbId !== undefined : !isUuid(b.chatDbId)) || b.scope === "char" && !Number.isSafeInteger(request.generation) || typeof request.entity !== "string")
        return invalidRequest();
      await storage.validateIdentityBinding(b);
      if (request.readOnly)
        deletions.assertBinding(b);
      else
        await deletions.verify(b, request.entity, b.scope === "chat");
      renames.assertEntity(b, request.entity);
      renames.assertEntity(b, b.characterEntity);
      if (b.scope === "chat")
        await entities.verify({ ...b, scope: "char", chatDbId: undefined }, false, request.readOnly);
      const id = b.scope === "chat" ? b.chatDbId : b.charDbId;
      const generation = request.readOnly ? await entities.confirmReadOnly(b, request.entity, id, b.scope === "chat") : await entities.confirm(b, request.entity, id, b.scope === "chat", request.generation);
      if (!request.readOnly)
        await storage.registerObserved(b);
      if (request.generation !== undefined && request.generation !== generation)
        throw new ServiceError({ code: "STALE_IDENTITY", resultKind: "identity", message: "恢复的文件引用代次已失效。" });
      return {
        identityId: id,
        generation,
        referenceId: (await entities.credential(b, request.entity, b.scope === "chat")).referenceId,
        restored: true
      };
    }
    async function chat(request, port) {
      const b = request.binding;
      if (!b || b.scope !== "char" || !isUuid(b.charDbId) || b.chatDbId !== undefined || typeof request.entity !== "string" || !request.entity)
        return invalidRequest();
      await storage.validateIdentityBinding(b);
      const coordinator = chats(b, request.entity);
      if (request.type === "chat-identity-acquire") {
        await entities.verify(b);
        await deletions.verify(b, request.entity, true);
        renames.assertEntity(b, request.entity);
        renames.assertEntity(b, b.characterEntity);
        if (request.observedId) {
          await entities.confirm(b, request.entity, request.observedId, true);
          await storage.registerObserved({ ...b, scope: "chat", chatDbId: request.observedId });
        } else {
          const candidate = await entities.candidate(b, request.entity);
          if (candidate)
            coordinator.seed(request.entity, candidate);
        }
        const ticket = await coordinator.acquire(request.entity, request.observedId, port);
        return finishIdentityAcquisition(b, request.entity, true, ticket, coordinator, port);
      }
      if (typeof request.token !== "string" || typeof request.confirmed !== "boolean")
        return invalidRequest();
      return settleIdentity(b, request.entity, request.token, request.confirmed, true, coordinator, port);
    }
    async function role(request) {
      const b = request.binding;
      if (typeof request.entity !== "string" || !request.entity || !b || b.scope && b.scope !== "global" || b.charDbId !== undefined || b.chatDbId !== undefined)
        return invalidRequest();
      await storage.validateIdentityBinding(b);
      if (request.type === "identity-lookup") {
        if (request.readOnly)
          deletions.assertEntity(b, request.entity);
        else
          await deletions.verify(b, request.entity);
        renames.assertEntity(b, request.entity);
        const role = await entities.lookupRole(b, request.entity);
        return role ? { identityId: role.id, generation: role.generation, referenceId: role.referenceId } : null;
      }
      await deletions.verify(b, request.entity);
      renames.assertEntity(b, request.entity);
      if (request.create !== undefined && typeof request.create !== "boolean")
        return invalidRequest();
      const role = await entities.prepareRole(b, request.entity, (id) => storage.registerPreparedRole({ ...b, scope: "char", charDbId: id }), request.create === true);
      deletions.assertEntity(b, request.entity);
      return role ? { identityId: role.id, generation: role.generation, referenceId: role.referenceId } : null;
    }
    return { restore, chat, role };
  }

  // src/worker/runtime.ts
  function createWorkerRuntime(options) {
    const { engine, saveDebounceMs } = options;
    engine.catch(() => {});
    const instanceId = randomUuid();
    let exited = false;
    const chatIdentities = new Map;
    const ports = new Set;
    const lastSeen = new Map;
    const key = identityBindingKey;
    function removePort(port) {
      restart.disconnected(port);
      for (const identity of chatIdentities.values())
        identity.disconnect(port);
      ports.delete(port);
      lastSeen.delete(port);
      port.onmessage = null;
      port.onmessageerror = null;
      port.close();
    }
    const heartbeatTimer = setInterval(() => {
      for (const [port, time] of lastSeen)
        if (Date.now() - time > 90000)
          removePort(port);
    }, 30000);
    function broadcast(event) {
      for (const port of ports) {
        try {
          port.postMessage(event);
        } catch {
          removePort(port);
        }
      }
    }
    const storage = new StorageCoordinator(new IndexedDbConfiguration, async (source, binding, mode) => new SingleDatabase(await engine, createStorage(source, binding?.charDbId, binding?.chatDbId, mode === "opfs"), undefined, saveDebounceMs), (info) => {
      const event = { type: "storage-changed", instanceId, ...withEntityRevision(info) };
      broadcast(event);
    });
    const renames = new EntityRenames((binding, task) => storage.manageEntities(binding, task));
    storage.onBackgroundSaveFailed = (binding, failure) => {
      broadcast({ type: "background-save-failed", instanceId, binding, ...failure });
    };
    function chatCoordinate(entity) {
      if (!entity)
        return false;
      try {
        const parts = JSON.parse(entity);
        return Array.isArray(parts) && parts.length === 2 && parts.every((part) => typeof part === "string");
      } catch {
        return false;
      }
    }
    const deletions = new EntityDeletions(storage, (binding, ticket) => {
      if (ticket.stage === "applied")
        for (const c of ticket.credentials ?? [])
          entities.forgetReference(binding, c.referenceId, c.chat);
      broadcast({
        type: "entity-deleted",
        instanceId,
        storageId: binding.storageId,
        configGeneration: binding.configGeneration,
        ticket
      });
    });
    function withEntityRevision(info) {
      return {
        ...info,
        storage: {
          ...info.storage,
          entityRevision: info.storage.storageId ? deletions.revision({ storageId: info.storage.storageId, configGeneration: info.storage.configGeneration }) : 0
        }
      };
    }
    const entities = new EntityCoordinator((binding, task) => storage.manageEntities(binding, task), (binding, entity) => {
      renames.assertEntity(binding, entity);
      deletions.assertEntity(binding, entity, entity !== binding.characterEntity && chatCoordinate(entity));
    }, (binding, id, chat) => storage.assertIdentityTargetAvailable({
      ...binding,
      scope: chat ? "chat" : "char",
      charDbId: chat ? binding.charDbId : id,
      ...chat ? { chatDbId: id } : { chatDbId: undefined }
    }), (binding, task) => storage.manageEntities(binding, task, true));
    storage.beforeScopedExecution = (binding) => entities.assertCached(binding);
    storage.beforeConfigurationChange = () => {
      renames.assertSettled();
      deletions.assertSettled();
    };
    storage.beforeManagementRepair = () => {
      for (const coordinator of chatIdentities.values())
        coordinator.assertSettled();
    };
    storage.cleanupWaiting = (binding, target) => deletions.isCleanupWaiting(binding, target);
    storage.beforeScanRepair = (binding, request) => {
      const entity = request.scope === "chat" ? JSON.stringify([request.avatar, request.file]) : undefined;
      renames.assertEntity(binding, request.avatar);
      renames.assertEntity(binding, entity);
      deletions.assertEntity(binding, request.avatar);
      if (entity)
        deletions.assertEntity(binding, entity, true);
      const busy = [...chatIdentities].some(([key, coordinator]) => {
        const domain = JSON.parse(key);
        return domain[0] === binding.storageId && domain[1] === binding.configGeneration && coordinator.hasWorkFor((value) => entity !== undefined ? value === entity : (() => {
          try {
            return JSON.parse(value)[0] === request.avatar;
          } catch {
            return false;
          }
        })());
      });
      const cleanup = request.scope === "chat" ? [request.chatDbId, request.expectedChat?.id].filter(Boolean).some((chatDbId) => storage.cleanupWaiting?.(binding, { scope: "chat", charDbId: request.charDbId, chatDbId })) : storage.cleanupWaiting?.(binding, { scope: "char", charDbId: request.charDbId });
      if (busy || cleanup)
        throw new ServiceError({
          code: "RESULT_UNCONFIRMED",
          resultState: "not-applied",
          message: "这份数据仍在处理中，请等待当前操作结束后重新扫描。"
        });
    };
    storage.invalidateScanReference = (binding, record) => entities.forgetReference(binding, record.referenceId, record.scope === "chat");
    storage.scanRepairCompleted = (binding, request) => {
      if (request.scope !== "chat")
        return;
      for (const [key, coordinator] of chatIdentities) {
        const domain = JSON.parse(key);
        if (domain[0] === binding.storageId && domain[1] === binding.configGeneration)
          coordinator.forget(JSON.stringify([request.avatar, request.file]));
      }
    };
    const idleTimer = setInterval(() => {
      storage.releaseIdle();
    }, 30000);
    const identity = createIdentityRequests({ storage, entities, deletions, renames, chatIdentities });
    const active = new Set;
    async function verifyDrain() {
      renames.assertSettled();
      deletions.assertSettled();
      await storage.drainForRestart();
      for (const coordinator of chatIdentities.values())
        coordinator.assertSettled();
    }
    const restart = new RestartCoordinator((port, event) => port.postMessage(event), async () => {
      while (active.size)
        await Promise.allSettled([...active]);
      await verifyDrain();
    });
    const isBusinessWrite = isWriteAction;
    const preflightError = (request, error) => isBusinessWrite(request) ? beforeBusinessSqlError(error) : error;
    function executeWrite(operation, binding, execute = (commands, id) => storage.executeWrite(binding, commands, id)) {
      let commands, id;
      try {
        commands = writeCommands(operation);
        id = operation.callId ?? randomUuid();
      } catch (error) {
        throw beforeBusinessSqlError(error);
      }
      return execute(commands, id);
    }
    async function dispatch(request, port) {
      if (request.protocolVersion !== PROTOCOL_VERSION)
        throw preflightError(request, new ServiceError({ code: "PROTOCOL_MISMATCH", message: "通信协议不兼容，请关闭所有旧验证页后加载同一构建。" }));
      if (request.type === "restart-prepare") {
        restart.assertParticipant(port);
        if (!isUuid(request.targetBuildId))
          return invalidRequest();
        if (request.targetProtocolVersion !== PROTOCOL_VERSION) {
          const error = { code: "PROTOCOL_MISMATCH", message: "目标协议不兼容，取消准备。" };
          restart.cancel(error);
          throw new ServiceError(error);
        }
        if (request.purpose !== undefined && !["update", "disable"].includes(request.purpose))
          return invalidRequest();
        return restart.prepare(request.targetBuildId, ports, request.automatic === true, request.purpose);
      }
      if (request.type === "restart-reply") {
        if (typeof request.attemptId !== "string")
          return invalidRequest();
        restart.reply(port, request.attemptId, request.error);
        return {};
      }
      if (request.type === "restart-cancel") {
        if (typeof request.attemptId !== "string")
          return invalidRequest();
        restart.cancelAttempt(port, request.attemptId);
        return {};
      }
      if (request.type === "restart-commit") {
        if (typeof request.attemptId !== "string")
          return invalidRequest();
        return restart.commit(port, request.attemptId, (authorize) => storage.closeForRestart(() => {
          renames.assertSettled();
          deletions.assertSettled();
          for (const coordinator of chatIdentities.values())
            coordinator.assertSettled();
          authorize();
        }), () => {
          exited = true;
          clearInterval(heartbeatTimer);
          clearInterval(idleTimer);
          for (const connected of ports)
            removePort(connected);
          options.exit();
        });
      }
      if (request.type === "hello" && restart.state !== "idle")
        throw new ServiceError({ code: "SERVICE_RESTARTING", message: "全局准备期间暂停新连接握手，请取消后显式重连。" });
      try {
        if (!["ping", "disconnect", "storage-status", "restart-drain"].includes(request.type))
          restart.assertAdmission(port);
      } catch (error) {
        throw preflightError(request, error);
      }
      if (request.type === "restart-drain") {
        await verifyDrain();
        return { drained: true, buildId: BUILD_ID, protocolVersion: PROTOCOL_VERSION };
      }
      if (request.type === "entity-delete-begin")
        return deletions.begin(request.kind, request.entity, request.operationId, request.deleteChats, request.binding);
      if (request.type === "entity-delete-pending")
        return deletions.pending(request.binding);
      if (request.type === "entity-delete-settle") {
        if (!isUuid(request.taskId) || typeof request.confirmed !== "boolean" || typeof request.absent !== "boolean" || request.requestOperationId !== undefined && !isUuid(request.requestOperationId) || request.nativeResult !== undefined && !["success", "failed", "unknown"].includes(request.nativeResult) || request.observedId !== undefined && request.observedId !== null && !isUuid(request.observedId) || request.remainingChatNames !== undefined && (!Array.isArray(request.remainingChatNames) || request.remainingChatNames.length > 256 || request.remainingChatNames.some((name) => typeof name !== "string" || !name) || new Set(request.remainingChatNames).size !== request.remainingChatNames.length))
          return invalidRequest();
        return deletions.settle(request, request.binding);
      }
      if (request.type === "entity-delete-resume") {
        return deletions.resume(request.binding);
      }
      if (request.type === "entity-rename-begin")
        return renames.begin(request.kind, request.oldEntity, request.newEntity, request.binding);
      if (request.type === "entity-rename-settle") {
        await storage.validateIdentityBinding(request.binding);
        if (!isUuid(request.taskId) || typeof request.checkedOldEntity !== "string" || typeof request.checkedNewEntity !== "string" || typeof request.confirmed !== "boolean" || request.observedId !== null && !isUuid(request.observedId))
          return invalidRequest();
        const result = await renames.settle({
          taskId: request.taskId,
          kind: request.kind,
          oldEntity: request.oldEntity,
          newEntity: request.newEntity,
          checkedOldEntity: request.checkedOldEntity,
          checkedNewEntity: request.checkedNewEntity,
          stage: "pending",
          expected: request.expected
        }, request.observedId, request.confirmed, request.binding, () => {
          const avatars = request.kind === "char" ? [request.oldEntity, request.newEntity] : [JSON.parse(request.oldEntity)[0], JSON.parse(request.newEntity)[0]];
          const affects = (entity) => request.kind === "chat" ? entity === request.oldEntity || entity === request.newEntity : (() => {
            try {
              return avatars.includes(JSON.parse(entity)[0]);
            } catch {
              return false;
            }
          })();
          return [...chatIdentities.values()].some((coordinator) => coordinator.hasWorkFor(affects));
        });
        if (result.stage === "applied")
          broadcast({
            type: "entity-renamed",
            instanceId,
            storageId: request.binding.storageId,
            configGeneration: request.binding.configGeneration
          });
        return result;
      }
      if (request.type === "identity-restore")
        return identity.restore(request);
      if (request.type === "chat-identity-acquire" || request.type === "chat-identity-settle")
        return identity.chat(request, port);
      if (request.type === "identity-acquire" || request.type === "identity-lookup")
        return identity.role(request);
      if (request.type === "scan-cleanup") {
        const result = await deletions.cleanScan(request.request, request.binding);
        if (result.record.status === "removed")
          entities.forgetReference(request.binding, request.request.expected.referenceId, request.request.expected.scope === "chat");
        return result;
      }
      if (request.type === "scan")
        return storage.scan(request.binding, request.request);
      if (request.type === "scan-repair")
        return storage.repairScan(request.binding, request.request);
      if (request.type === "database-maintenance")
        return storage.maintainDatabase(request.binding, request.request);
      if (request.type === "identity-restart")
        return storage.restartIdentity(request.binding, request.request);
      if (request.type === "scan-management-repair")
        return storage.repairManagement(request.binding, request.request);
      if (request.type === "scan-remove-entry")
        return storage.removeScanEntry(request.binding, request.request);
      if (request.type === "scan-remove-target")
        return storage.removeScanTarget(request.binding, request.target);
      try {
        if ("binding" in request && request.binding) {
          deletions.assertBinding(request.binding);
          await entities.verify(request.binding, false, request.type === "viewer");
        }
      } catch (error) {
        throw preflightError(request, error);
      }
      if (request.type === "hello") {
        await engine;
        return { protocolVersion: PROTOCOL_VERSION, buildId: BUILD_ID, ...withEntityRevision(await storage.getStatus()) };
      }
      if (request.type === "ping")
        return { alive: true };
      if (request.type === "disconnect") {
        removePort(port);
        return {};
      }
      if (request.type === "storage-status")
        return withEntityRevision(await storage.getStatus());
      if (request.type === "storage-configure")
        return withEntityRevision(await storage.configureMode(request.mode, request.autoReloadEnabled));
      if (request.type === "open") {
        if (!request.directory || request.directory.kind !== "directory" || typeof request.directory.getFileHandle !== "function" || typeof request.directory.isSameEntry !== "function")
          return invalidRequest();
        return withEntityRevision(await storage.select(request.directory));
      }
      if (request.type === "check-permission")
        return withEntityRevision(await storage.resume(request.binding));
      if (request.type === "refresh")
        return storage.refresh(request.binding);
      if (request.type === "batch") {
        if (!Array.isArray(request.operations) || !request.operations.length) {
          try {
            invalidRequest();
          } catch (error) {
            throw beforeBusinessSqlError(error);
          }
        }
        return storage.executeBatch(request.binding, async (execute) => {
          const results = [];
          for (const operation of request.operations) {
            let handedOff = false;
            try {
              if (!operation || typeof operation.callId !== "string" || !operation.binding || key(operation.binding) !== key(request.binding))
                invalidRequest();
              entities.assertCached(operation.binding);
              handedOff = true;
              const result = await executeWrite(operation, request.binding, execute);
              results.push({ callId: operation.callId, ok: true, result });
            } catch (error) {
              const data = {
                ...errorData(handedOff ? error : beforeBusinessSqlError(error)),
                operationId: operation?.callId
              };
              results.push({ callId: operation?.callId ?? "", ok: false, error: data });
            }
          }
          return results;
        });
      }
      if (isWriteAction(request))
        return executeWrite(request, request.binding);
      if (request.type === "viewer")
        return storage.inspect(request.binding, (db) => db.viewer(request.request, () => {
          if (request.binding)
            entities.assertCached(request.binding);
        }));
      if (request.type === "query") {
        checkQueryPrefix(request.sql);
        const query = { sql: request.sql, binds: validateSerializedBinds(request.binds) };
        return storage.execute(request.binding, (db) => db.query(query, () => {
          if (request.binding)
            entities.assertCached(request.binding);
        }));
      }
      return invalidRequest();
    }
    function connectPort(port) {
      if (exited)
        throw new ServiceError({ code: "INSTANCE_DISABLED", message: "页面内数据库实例已退出，请刷新页面。" });
      ports.add(port);
      lastSeen.set(port, Date.now());
      port.onmessageerror = () => {
        removePort(port);
      };
      port.onmessage = (event) => {
        if (!ports.has(port))
          return;
        lastSeen.set(port, Date.now());
        const request = event.data;
        if (!request || typeof request.requestId !== "string")
          return;
        (async () => {
          let response;
          try {
            const work = dispatch(request, port);
            const business = ![
              "ping",
              "disconnect",
              "storage-status",
              "restart-drain",
              "restart-prepare",
              "restart-reply",
              "restart-cancel",
              "restart-commit"
            ].includes(request.type);
            if (business) {
              active.add(work);
              work.finally(() => active.delete(work)).catch(() => {});
            }
            response = { requestId: request.requestId, instanceId, ok: true, result: await work };
          } catch (error) {
            const data = errorData(error);
            response = {
              requestId: request.requestId,
              instanceId,
              ok: false,
              error: isBusinessWrite(request) ? {
                ...data,
                failureKind: data.failureKind ?? "service",
                executionState: data.executionState ?? "unknown"
              } : data
            };
          }
          try {
            port.postMessage(response);
          } catch {
            removePort(port);
          }
        })();
      };
      port.start();
    }
    return { connectPort };
  }

  // src/worker/sql-loader.ts
  function loadWorkerSqlJs() {
    try {
      const base = self.location.href;
      importScripts(new URL("sql-wasm.js", base).href);
      return globalThis.initSqlJs({
        locateFile: (file) => new URL(file, base).href
      });
    } catch (error) {
      return Promise.reject(error);
    }
  }

  // src/worker/entry.ts
  var runtime = createWorkerRuntime({ engine: loadWorkerSqlJs(), saveDebounceMs: 1000, exit: () => self.close() });
  self.onconnect = (event) => {
    runtime.connectPort(event.ports[0]);
  };
})();
