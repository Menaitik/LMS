import { useState, useEffect, useRef } from "react";
import { Link, matchPath, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { TiShoppingCart } from "react-icons/ti";
import { IoIosArrowDown, IoMdSearch } from "react-icons/io";
import { FaBars, FaTimes } from "react-icons/fa";
import ProfileDropDown from "../core/Auth/ProfileDropDown";
import { categories, courseEndpoints } from "../../services/apis";
import { apiConnector } from "../../services/apiConnector";
import logo from "../../assets/Logo/Logo-Full-Light.png";
import NotificationBell from "./NotificationBell";

const NavBar = () => {
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);
  const { totalItems } = useSelector((state) => state.cart);
  const location = useLocation();
  const navigate = useNavigate();

  const [subLinks, setSubLinks] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const menuRef = useRef(null);
  const searchRef = useRef(null);
  const suggestTimer = useRef(null);

  useEffect(() => {
    const fetchSublinks = async () => {
      try {
        const result = await apiConnector("GET", categories.CATALOGPAGEDATA_API);
        setSubLinks(result.data.data);
      } catch (e) {
        console.log("Error fetching categories:", e);
      }
    };
    fetchSublinks();
  }, []);

  const matchRoute = (route) => matchPath({ path: route }, location.pathname);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
        setCatalogOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setCatalogOpen(false);
  }, [location.pathname]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSearchChange = (val) => {
    setSearchQuery(val);
    clearTimeout(suggestTimer.current);
    if (val.trim().length < 2) { setSuggestions([]); setShowSuggestions(false); return; }
    suggestTimer.current = setTimeout(async () => {
      try {
        const res = await apiConnector("GET", `${courseEndpoints.SUGGEST_COURSES_API}?q=${encodeURIComponent(val)}`);
        if (res.data.success) { setSuggestions(res.data.data); setShowSuggestions(true); }
      } catch { /* silent */ }
    }, 250);
  };

  const handleSuggestionClick = (course) => {
    navigate(`/courses/${course._id}`);
    setSearchQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const isStudent = !user || user.accountType === "Student";

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-richblack-900 border-b border-richblack-700 shadow-md">

      {/* ── DESKTOP NAV ── */}
      <div className="hidden lg:flex items-center h-[60px] px-6 gap-4 max-w-[1400px] mx-auto">

        {/* Logo */}
        <Link to="/" className="shrink-0 mr-2">
          <img src={logo} alt="StudyNotion" width={148} height={38} loading="lazy" />
        </Link>

        {/* Find Courses dropdown */}
        <div className="relative group shrink-0">
          <button
            className={`flex items-center gap-1 text-sm font-medium px-1 py-1 transition-colors ${
              matchRoute("/catalog/:catalogName")
                ? "text-yellow-400"
                : "text-richblack-100 hover:text-white"
            }`}
          >
            Find Courses
            <IoIosArrowDown className="text-xs" />
          </button>
          {/* Dropdown */}
          <div className="invisible absolute left-0 top-[calc(100%+8px)] z-50 min-w-[200px] rounded-lg bg-richblack-800 border border-richblack-600 py-2 shadow-2xl opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100">
            {subLinks.length ? (
              subLinks.map((sub, i) => (
                <Link
                  key={i}
                  to={`/catalog/${sub.name.split(" ").join("-").toLowerCase()}`}
                  className="block px-4 py-2 text-sm text-richblack-100 hover:bg-richblack-700 hover:text-white transition-colors"
                >
                  {sub.name}
                </Link>
              ))
            ) : (
              <p className="px-4 py-2 text-sm text-richblack-400">No categories</p>
            )}
          </div>
        </div>

        {/* Search bar — grows to fill space */}
        <div ref={searchRef} className="relative flex-1 mx-2 ml-3">
          <form
            onSubmit={handleSearch}
            className="flex items-center bg-richblack-800 border border-richblack-600 rounded-full h-10 px-4 gap-2 focus-within:border-yellow-400 focus-within:bg-richblack-700 transition-all"
          >
            <IoMdSearch className="text-richblack-400 text-lg shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              placeholder="Search for anything"
              className="bg-transparent text-sm text-richblack-5 placeholder:text-richblack-400 outline-none w-full"
            />
          </form>
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-[calc(100%+6px)] left-0 w-full bg-richblack-800 border border-richblack-600 rounded-xl shadow-2xl z-50 overflow-hidden">
              {suggestions.map((s) => (
                <button key={s._id} onMouseDown={() => handleSuggestionClick(s)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-richblack-700 transition text-left">
                  <img src={s.thumbnail} alt="" className="w-9 h-9 rounded-md object-cover shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm text-richblack-5 truncate">{s.courseName}</p>
                    <p className="text-xs text-richblack-400">{s.level}</p>
                  </div>
                  <IoMdSearch className="text-richblack-500 ml-auto shrink-0" />
                </button>
              ))}
              <button
                onMouseDown={() => { navigate(`/search?q=${encodeURIComponent(searchQuery)}`); setShowSuggestions(false); setSearchQuery(""); }}
                className="w-full px-4 py-2.5 text-sm text-yellow-400 hover:bg-richblack-700 transition text-left border-t border-richblack-700">
                See all results for "{searchQuery}"
              </button>
            </div>
          )}
        </div>

        {/* Right side group */}
        <div className="flex items-center gap-3 shrink-0">

          {/* Become an Educator — only when logged out */}
          {token === null && (
            <Link
              to="/signup?role=Instructor"
              className="text-sm text-richblack-100 hover:text-white transition-colors whitespace-nowrap ml-2"
            >
              Become an Educator
            </Link>
          )}

          {/* Cart */}
          {isStudent && (
            <Link to="/dashboard/cart" className="relative p-1 text-richblack-100 hover:text-white transition-colors">
              <TiShoppingCart className="text-[22px]" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-yellow-400 text-[9px] font-bold text-richblack-900 leading-none">
                  {totalItems}
                </span>
              )}
            </Link>
          )}

          {token !== null && <NotificationBell />}

          {token === null ? (
            <>
              <Link to="/login">
                <button className="h-9 px-4 text-sm font-medium text-richblack-100 border border-richblack-500 rounded-md hover:bg-richblack-700 hover:text-white transition-all">
                  Log in
                </button>
              </Link>
              <Link to="/signup">
                <button className="h-9 px-4 text-sm font-semibold bg-yellow-400 hover:bg-yellow-300 text-richblack-900 rounded-md transition-all">
                  Sign up
                </button>
              </Link>
            </>
          ) : (
            <ProfileDropDown />
          )}
        </div>
      </div>

      {/* ── MOBILE NAV ── */}
      <div className="lg:hidden flex items-center justify-between h-14 px-4">
        {/* Hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-white text-xl focus:outline-none p-1"
          aria-label="Toggle menu"
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>

        {/* Centered Logo */}
        <Link to="/" className="absolute left-1/2 -translate-x-1/2" onClick={() => setMenuOpen(false)}>
          <img src={logo} alt="StudyNotion" width={130} height={34} loading="lazy" />
        </Link>

        {/* Right icons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/search")}
            className="text-white text-xl p-1"
            aria-label="Search"
          >
            <IoMdSearch />
          </button>
          {isStudent && (
            <Link to="/dashboard/cart" className="relative p-1 text-white">
              <TiShoppingCart className="text-[22px]" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-yellow-400 text-[9px] font-bold text-richblack-900">
                  {totalItems}
                </span>
              )}
            </Link>
          )}
        </div>
      </div>

      {/* ── MOBILE DRAWER ── */}
      <div
        ref={menuRef}
        className={`lg:hidden fixed top-14 left-0 h-[calc(100vh-56px)] w-full bg-richblack-900 flex flex-col overflow-y-auto transition-transform duration-300 ease-in-out ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col p-5 gap-0">

          {/* Mobile Search */}
          <form
            onSubmit={(e) => { handleSearch(e); setMenuOpen(false); }}
            className="flex items-center bg-richblack-800 border border-richblack-600 rounded-full h-10 px-4 gap-2 mb-5 focus-within:border-yellow-400 transition-all"
          >
            <IoMdSearch className="text-richblack-400 text-lg shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for anything"
              className="bg-transparent text-sm text-richblack-5 placeholder:text-richblack-400 outline-none w-full"
            />
          </form>

          {/* Find Courses */}
          <div className="border-b border-richblack-700">
            <button
              onClick={() => setCatalogOpen(!catalogOpen)}
              className="flex items-center justify-between w-full py-3.5 text-[15px] font-medium text-white"
            >
              Find Courses
              <IoIosArrowDown className={`text-richblack-300 transition-transform duration-200 ${catalogOpen ? "rotate-180" : ""}`} />
            </button>
            {catalogOpen && (
              <div className="flex flex-col pb-2 pl-3 gap-0.5">
                {subLinks.map((sub, i) => (
                  <Link
                    key={i}
                    to={`/catalog/${sub.name.split(" ").join("-").toLowerCase()}`}
                    onClick={() => setMenuOpen(false)}
                    className="py-2 text-sm text-richblack-200 hover:text-yellow-400 transition-colors"
                  >
                    {sub.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Become an Educator */}
          <Link
            to="/signup?role=Instructor"
            onClick={() => setMenuOpen(false)}
            className="py-3.5 text-[15px] font-medium text-white border-b border-richblack-700"
          >
            Become an Educator
          </Link>

          {/* Auth */}
          {token === null ? (
            <div className="flex gap-3 mt-6">
              <Link to="/login" onClick={() => setMenuOpen(false)} className="flex-1">
                <button className="w-full h-10 border border-richblack-500 text-sm font-medium text-white rounded-md hover:bg-richblack-700 transition-all">
                  Log in
                </button>
              </Link>
              <Link to="/signup" onClick={() => setMenuOpen(false)} className="flex-1">
                <button className="w-full h-10 bg-yellow-400 hover:bg-yellow-300 text-richblack-900 font-semibold text-sm rounded-md transition-all">
                  Sign up
                </button>
              </Link>
            </div>
          ) : (
            <div className="mt-5">
              <ProfileDropDown />
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default NavBar;
